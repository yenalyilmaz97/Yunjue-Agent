using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace KeciApp.API.Services;
public class PodcastEpisodesService : IPodcastEpisodesService
{
    private readonly IPodcastEpisodesRepository _podcastEpisodesRepository;
    private readonly IPodcastSeriesRepository _podcastSeriesRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICdnUploadService _cdnUploadService;
    private readonly IMapper _mapper;
    private readonly ILogger<PodcastEpisodesService> _logger;

    public PodcastEpisodesService(
        IPodcastEpisodesRepository podcastEpisodesRepository, 
        IPodcastSeriesRepository podcastSeriesRepository, 
        IFileUploadService fileUploadService,
        ICdnUploadService cdnUploadService,
        IMapper mapper,
        ILogger<PodcastEpisodesService> logger)
    {
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _podcastSeriesRepository = podcastSeriesRepository;
        _fileUploadService = fileUploadService;
        _cdnUploadService = cdnUploadService;
        _mapper = mapper;
        _logger = logger;
    }
    public async Task<IEnumerable<PodcastEpisodeResponseDTO>> GetAllPodcastEpisodesBySeriesIdAsync(int seriesId)
    {
        var episodes = await _podcastEpisodesRepository.GetAllPodcastEpisodesBySeriesIdAsync(seriesId);
        return episodes.Select(MapToResponseDTO);
    }
    
    public async Task<IEnumerable<PodcastEpisodeResponseDTO>> GetEligiblePodcastEpisodesByUserIdAsync(int userId)
    {
        var episodes = await _podcastEpisodesRepository.GetEligiblePodcastEpisodesByUserIdAsync(userId);
        return episodes.Select(MapToResponseDTO);
    }
    
    public async Task<PodcastEpisodeResponseDTO> GetPodcastEpisodeByIdAsync(int? episodeId)
    {
        var episode = await _podcastEpisodesRepository.GetPodcastEpisodeByIdAsync(episodeId);
        if (episode == null)
        {
            throw new InvalidOperationException("Podcast episode not found");
        }
        return MapToResponseDTO(episode);
    }
    
    private PodcastEpisodeResponseDTO MapToResponseDTO(PodcastEpisodes episode)
    {
        var dto = _mapper.Map<PodcastEpisodeResponseDTO>(episode);
        
        // Deserialize ContentJson to EpisodeContent
        try
        {
            if (!string.IsNullOrEmpty(episode.ContentJson))
            {
                dto.Content = JsonSerializer.Deserialize<EpisodeContent>(episode.ContentJson) ?? new EpisodeContent();
            }
            else
            {
                dto.Content = new EpisodeContent();
            }
        }
        catch
        {
            dto.Content = new EpisodeContent();
        }
        
        return dto;
    }
    public async Task<PodcastEpisodeResponseDTO> CreatePodcastEpisodeAsync(CreatePodcastEpisodeRequest request)
    {
        var episode = _mapper.Map<PodcastEpisodes>(request);
        
        // Serialize Content to JSON
        episode.ContentJson = JsonSerializer.Serialize(request.Content);
        
        if (request.IsVideo == null)
        {
            PodcastSeries series = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(request.SeriesId);
            if (series != null)
            {
                episode.isVideo = series.isVideo;
            }
        }
        // Auto-assign next sequence number
        var maxSeq = await _podcastEpisodesRepository.GetMaxEpisodeSequenceAsync(request.SeriesId);
        episode.SequenceNumber = maxSeq + 1;
        episode.CreatedAt = DateTime.UtcNow;
        episode.UpdatedAt = DateTime.UtcNow;
        
        var createdEpisode = await _podcastEpisodesRepository.CreatePodcastEpisodeAsync(episode);
        return MapToResponseDTO(createdEpisode);
    }
    public async Task<PodcastEpisodeResponseDTO> UpdatePodcastEpisodeAsync(EditPodcastEpisodeRequest request)
    {
        var existingEpisode = await _podcastEpisodesRepository.GetPodcastEpisodeByIdAsync(request.EpisodeId);
        if (existingEpisode == null)
        {
            throw new InvalidOperationException("Podcast episode not found");
        }

        existingEpisode.SeriesId = request.SeriesId;
        existingEpisode.Title = request.Title;
        existingEpisode.Description = request.Description;
        existingEpisode.ContentJson = JsonSerializer.Serialize(request.Content);
        existingEpisode.SequenceNumber = request.SequenceNumber;
        existingEpisode.isActive = request.IsActive;
        existingEpisode.isVideo = request.IsVideo;
        existingEpisode.UpdatedAt = DateTime.UtcNow;

        var updatedEpisode = await _podcastEpisodesRepository.UpdatePodcastEpisodeAsync(existingEpisode);
        return MapToResponseDTO(updatedEpisode);
    }
    public async Task RemovePodcastEpisodeAsync(int episodeId)
    {
        var existingEpisode = await _podcastEpisodesRepository.GetPodcastEpisodeByIdAsync(episodeId);
        if (existingEpisode == null)
        {
            throw new InvalidOperationException("Podcast episode not found");
        }

        // Get series information for folder deletion
        var series = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(existingEpisode.SeriesId);
        string seriesSlug = series != null ? _fileUploadService.GenerateSlug(series.Title) : string.Empty;
        string titleSlug = _fileUploadService.GenerateSlug(existingEpisode.Title);

        // Delete files from CDN before removing episode
        try
        {
            EpisodeContent? content = null;
            if (!string.IsNullOrEmpty(existingEpisode.ContentJson))
            {
                content = JsonSerializer.Deserialize<EpisodeContent>(existingEpisode.ContentJson);
            }

            if (content != null)
            {
                // Delete audio file
                if (!string.IsNullOrWhiteSpace(content.Audio))
                {
                    await _fileUploadService.DeleteFileAsync(content.Audio);
                }

                // Delete video file
                if (!string.IsNullOrWhiteSpace(content.Video))
                {
                    await _fileUploadService.DeleteFileAsync(content.Video);
                }

                // Delete image files
                if (content.Images != null && content.Images.Count > 0)
                {
                    foreach (var imageUrl in content.Images)
                    {
                        if (!string.IsNullOrWhiteSpace(imageUrl))
                        {
                            await _fileUploadService.DeleteFileAsync(imageUrl);
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting files for episode {EpisodeId}. Episode will still be removed from database.", episodeId);
            // Continue with episode deletion even if file deletion fails
        }

        // Delete episode folder from CDN (podcast-episode/{seriesSlug}/{titleSlug}/)
        if (!string.IsNullOrWhiteSpace(seriesSlug) && !string.IsNullOrWhiteSpace(titleSlug))
        {
            try
            {
                string episodeFolderPath = $"podcast-episode/{seriesSlug}/{titleSlug}";
                await _cdnUploadService.DeleteDirectoryAsync(episodeFolderPath);
            }
            catch (Exception folderEx)
            {
                _logger.LogError(folderEx, "Error deleting episode folder for episode {EpisodeId}", episodeId);
                // Continue with episode deletion even if folder deletion fails
            }
        }

        await _podcastEpisodesRepository.RemovePodcastEpisodeAsync(existingEpisode);
    }
}
