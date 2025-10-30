using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;
public class PodcastEpisodesService : IPodcastEpisodesService
{
    private readonly IPodcastEpisodesRepository _podcastEpisodesRepository;
    private readonly IPodcastSeriesRepository _podcastSeriesRepository;
    private readonly IMapper _mapper;

    private PodcastEpisodesService(IPodcastEpisodesRepository podcastEpisodesRepository, IPodcastSeriesRepository podcastSeriesRepository, IMapper mapper)
    {
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _podcastSeriesRepository = podcastSeriesRepository;
        _mapper = mapper;
    }
    public async Task<IEnumerable<PodcastEpisodeResponseDTO>> GetAllPodcastEpisodesBySeriesIdAsync(int seriesId)
    {
        var episodes = await _podcastEpisodesRepository.GetAllPodcastEpisodesBySeriesIdAsync(seriesId);
        return _mapper.Map<IEnumerable<PodcastEpisodeResponseDTO>>(episodes);
    }
    public async Task<IEnumerable<PodcastEpisodeResponseDTO>> GetEligiblePodcastEpisodesByUserIdAsync(int userId)
    {
        var episodes = await _podcastEpisodesRepository.GetEligiblePodcastEpisodesByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<PodcastEpisodeResponseDTO>>(episodes);
    }
    public async Task<PodcastEpisodeResponseDTO> GetPodcastEpisodeByIdAsync(int? episodeId)
    {
        var episode = await _podcastEpisodesRepository.GetPodcastEpisodeByIdAsync(episodeId);
        if (episode == null)
        {
            throw new InvalidOperationException("Podcast episode not found");
        }
        return _mapper.Map<PodcastEpisodeResponseDTO>(episode);
    }
    public async Task<PodcastEpisodeResponseDTO> CreatePodcastEpisodeAsync(CreatePodcastEpisodeRequest request)
    {
        var episode = _mapper.Map<PodcastEpisodes>(request);
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
        var createdEpisode = await _podcastEpisodesRepository.CreatePodcastEpisodeAsync(episode);
        return _mapper.Map<PodcastEpisodeResponseDTO>(createdEpisode);
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
        existingEpisode.AudioLink = request.AudioLink;
        existingEpisode.SequenceNumber = request.SequenceNumber;
        existingEpisode.isActive = request.IsActive;
        existingEpisode.isVideo = request.IsVideo;

        var updatedEpisode = await _podcastEpisodesRepository.UpdatePodcastEpisodeAsync(existingEpisode);
        return _mapper.Map<PodcastEpisodeResponseDTO>(updatedEpisode);
    }
    public async Task RemovePodcastEpisodeAsync(int episodeId)
    {
        var existingEpisode = await _podcastEpisodesRepository.GetPodcastEpisodeByIdAsync(episodeId);
        if (existingEpisode == null)
        {
            throw new InvalidOperationException("Podcast episode not found");
        }

        await _podcastEpisodesRepository.RemovePodcastEpisodeAsync(existingEpisode);
    }
}
