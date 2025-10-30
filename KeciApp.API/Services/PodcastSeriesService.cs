using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

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
        return _mapper.Map<IEnumerable<PodcastSeriesResponseDTO>>(series);
    }

    public async Task<PodcastSeriesResponseDTO> GetPodcastSeriesByIdAsync(int seriesId)
    {
        var series = await _podcastSeriesRepository.GetPodcastSeriesByIdAsync(seriesId);
        if (series == null)
        {
            throw new InvalidOperationException("Podcast series not found");
        }
        return _mapper.Map<PodcastSeriesResponseDTO>(series);
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
        return _mapper.Map<PodcastSeriesResponseDTO>(createdSeries);
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
                var ep = _mapper.Map<PodcastEpisodes>(episode);
                await _podcastEpisodesRepository.UpdatePodcastEpisodeAsync(ep);
            }
        }

        existingSeries.isActive = request.isActive;

        var updatedSeries = await _podcastSeriesRepository.UpdatePodcastSeriesAsync(existingSeries);
        return _mapper.Map<PodcastSeriesResponseDTO>(updatedSeries);
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
