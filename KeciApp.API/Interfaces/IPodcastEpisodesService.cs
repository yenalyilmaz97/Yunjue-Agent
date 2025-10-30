using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IPodcastEpisodesService
{
    Task<IEnumerable<PodcastEpisodeResponseDTO>> GetAllPodcastEpisodesBySeriesIdAsync(int seriesId);
    Task<IEnumerable<PodcastEpisodeResponseDTO>> GetEligiblePodcastEpisodesByUserIdAsync(int userId);
    Task<PodcastEpisodeResponseDTO> GetPodcastEpisodeByIdAsync(int? episodeId);
    Task<PodcastEpisodeResponseDTO> CreatePodcastEpisodeAsync(CreatePodcastEpisodeRequest request);
    Task<PodcastEpisodeResponseDTO> UpdatePodcastEpisodeAsync(EditPodcastEpisodeRequest request);
    Task RemovePodcastEpisodeAsync(int episodeId);
}
