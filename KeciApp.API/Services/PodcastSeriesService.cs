using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace KeciApp.API.Services;
public class PodcastSeriesService : IPodcastSeriesService
{
    private readonly IPodcastSeriesRepository _podcastSeriesRepository;
    private readonly IPodcastEpisodesRepository _podcastEpisodesRepository;
    private readonly IUserSeriesAccessRepository _userSeriesAccessRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICdnUploadService _cdnUploadService;
    private readonly IMapper _mapper;
    private readonly ILogger<PodcastSeriesService> _logger;

    public PodcastSeriesService(
        IPodcastSeriesRepository podcastSeriesRepository, 
        IPodcastEpisodesRepository podcastEpisodesRepository, 
        IUserSeriesAccessRepository userSeriesAccessRepository, 
        IUserRepository userRepository,
        IFileUploadService fileUploadService,
        ICdnUploadService cdnUploadService,
        IMapper mapper,
        ILogger<PodcastSeriesService> logger)
    {
        _podcastSeriesRepository = podcastSeriesRepository;
        _userRepository = userRepository;
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _userSeriesAccessRepository = userSeriesAccessRepository;
        _fileUploadService = fileUploadService;
        _cdnUploadService = cdnUploadService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<PodcastSeriesResponseDTO>> GetAllPodcastSeriesAsync()
    {
        var series = await _podcastSeriesRepository.GetAllPodcastSeriesAsync();
        return series.Select(MapToResponseDTO);
    }

    public async Task<PodcastSeriesResponseDTO> GetPodcastSeriesByIdAsync(int seriesId)
    {
        var series = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(seriesId);
        if (series == null)
        {
            throw new InvalidOperationException("Podcast series not found");
        }
        return MapToResponseDTO(series);
    }

    private PodcastSeriesResponseDTO MapToResponseDTO(PodcastSeries series)
    {
        var dto = _mapper.Map<PodcastSeriesResponseDTO>(series);
        
        // Map episodes with Content deserialization
        if (series.Episodes != null && series.Episodes.Any())
        {
            dto.Episodes = series.Episodes.Select(episode =>
            {
                var episodeDto = _mapper.Map<PodcastEpisodeResponseDTO>(episode);
                
                // Deserialize ContentJson to EpisodeContent
                try
                {
                    if (!string.IsNullOrEmpty(episode.ContentJson))
                    {
                        episodeDto.Content = JsonSerializer.Deserialize<EpisodeContent>(episode.ContentJson) ?? new EpisodeContent();
                    }
                    else
                    {
                        episodeDto.Content = new EpisodeContent();
                    }
                }
                catch
                {
                    episodeDto.Content = new EpisodeContent();
                }
                
                return episodeDto;
            }).ToList();
        }
        
        return dto;
    }

    public async Task<PodcastSeriesResponseDTO> CreatePodcastSeriesAsync(CreatePodcastSeriesRequest request)
    {
        var series = _mapper.Map<PodcastSeries>(request);
        series.isActive = true;
        var createdSeries = await _podcastSeriesRepository.CreatePodcastSeriesAsync(series);

        if (createdSeries != null)
        {
            var users = await _userRepository.GetAllUsersAsync();

            foreach (var user in users)
            {
                var req = new CreateUserSeriesAccessRequest
                {
                    UserId = user.UserId,
                    SeriesId = createdSeries.SeriesId,
                    CurrentAccessibleSequence = 1,
                };

                var access = _mapper.Map<UserSeriesAccess>(req);
                var resp = await _userSeriesAccessRepository.CreateUserSeriesAccessAsync(access);
            }
        }
        return MapToResponseDTO(createdSeries);
    }

    public async Task<PodcastSeriesResponseDTO> UpdatePodcastSeriesAsync(EditPodcastSeriesRequest request)
    {
        var existingSeries = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(request.SeriesId);
        if (existingSeries == null)
        {
            throw new InvalidOperationException("Podcast series not found");
        }

        existingSeries.Title = request.Title;
        existingSeries.Description = request.Description;
        existingSeries.isVideo = request.isVideo;

        if (existingSeries.isActive != request.isActive)
        {
            var episodes = await _podcastEpisodesRepository.GetAllPodcastEpisodesBySeriesIdAsync(existingSeries.SeriesId);
            foreach (var episode in episodes)
            {
                episode.isActive = request.isActive;
                episode.UpdatedAt = DateTime.UtcNow;
                await _podcastEpisodesRepository.UpdatePodcastEpisodeAsync(episode);
            }
        }

        existingSeries.isActive = request.isActive;

        var updatedSeries = await _podcastSeriesRepository.UpdatePodcastSeriesAsync(existingSeries);
        return MapToResponseDTO(updatedSeries);
    }

    public async Task RemovePodcastSeriesAsync(int seriesId)
    {
        var existingSeries = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(seriesId);
        if (existingSeries == null)
        {
            throw new InvalidOperationException("Podcast series not found");
        }

        // Get all episodes for this series
        var episodes = await _podcastEpisodesRepository.GetAllPodcastEpisodesBySeriesIdAsync(seriesId);
        string seriesSlug = _fileUploadService.GenerateSlug(existingSeries.Title);

        // Delete all episode files and folders from CDN
        foreach (var episode in episodes)
        {
            try
            {
                EpisodeContent? content = null;
                if (!string.IsNullOrEmpty(episode.ContentJson))
                {
                    content = JsonSerializer.Deserialize<EpisodeContent>(episode.ContentJson);
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

                // Delete episode folder from CDN (podcast-episode/{seriesSlug}/{titleSlug}/)
                try
                {
                    string titleSlug = _fileUploadService.GenerateSlug(episode.Title);
                    string episodeFolderPath = $"podcast-episode/{seriesSlug}/{titleSlug}";
                    await _cdnUploadService.DeleteDirectoryAsync(episodeFolderPath);
                }
                catch (Exception folderEx)
                {
                    _logger.LogWarning(folderEx, "Error deleting episode folder for episode {EpisodeId}", episode.EpisodesId);
                    // Continue with other episodes
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting files for episode {EpisodeId} during series deletion", episode.EpisodesId);
                // Continue with other episodes
            }
        }

        // Delete series folder from CDN (podcast-episode/{seriesSlug}/)
        try
        {
            string seriesFolderPath = $"podcast-episode/{seriesSlug}";
            await _cdnUploadService.DeleteDirectoryAsync(seriesFolderPath);
        }
        catch (Exception folderEx)
        {
            _logger.LogError(folderEx, "Error deleting series folder from CDN: {SeriesTitle}", existingSeries.Title);
            // Continue with series deletion even if folder deletion fails
        }

        await _podcastSeriesRepository.RemovePodcastSeriesAsync(existingSeries);
    }
}
