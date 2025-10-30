using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IPodcastSeriesService
{
    Task<IEnumerable<PodcastSeriesResponseDTO>> GetAllPodcastSeriesAsync();
    Task<PodcastSeriesResponseDTO> GetPodcastSeriesByIdAsync(int seriesId);
    Task<PodcastSeriesResponseDTO> CreatePodcastSeriesAsync(CreatePodcastSeriesRequest request);
    Task<PodcastSeriesResponseDTO> UpdatePodcastSeriesAsync(EditPodcastSeriesRequest request);
    Task RemovePodcastSeriesAsync(int seriesId);
}
