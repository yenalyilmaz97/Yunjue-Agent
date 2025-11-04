using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using System.Text.Json;

namespace KeciApp.API.Services;
public class PodcastSeriesService : IPodcastSeriesService
{
    private readonly IPodcastSeriesRepository _podcastSeriesRepository;
    private readonly IPodcastEpisodesRepository _podcastEpisodesRepository;
    private readonly IUserSeriesAccessRepository _userSeriesAccessRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public PodcastSeriesService(IPodcastSeriesRepository podcastSeriesRepository, IPodcastEpisodesRepository podcastEpisodesRepository, IUserSeriesAccessRepository userSeriesAccessRepository, IUserRepository userRepository,
        IMapper mapper)
    {
        _podcastSeriesRepository = podcastSeriesRepository;
        _userRepository = userRepository;
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _userSeriesAccessRepository = userSeriesAccessRepository;
        _mapper = mapper;
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

        await _podcastSeriesRepository.RemovePodcastSeriesAsync(existingSeries);
    }
}
