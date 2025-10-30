using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IPodcastEpisodesRepository
{
    Task<IEnumerable<PodcastEpisodes>> GetAllPodcastEpisodesBySeriesIdAsync(int seriesId);
    Task<IEnumerable<PodcastEpisodes>> GetEligiblePodcastEpisodesByUserIdAsync(int userId);
    Task<PodcastEpisodes?> GetPodcastEpisodeByIdAsync(int? episodeId);
    Task<int> GetMaxEpisodeSequenceAsync(int seriesId);
    Task<PodcastEpisodes> CreatePodcastEpisodeAsync(PodcastEpisodes episode);
    Task<PodcastEpisodes> UpdatePodcastEpisodeAsync(PodcastEpisodes episode);
    Task RemovePodcastEpisodeAsync(PodcastEpisodes episode);
}
