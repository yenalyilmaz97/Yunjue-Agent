using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IPodcastSeriesRepository
{
    Task<IEnumerable<PodcastSeries>> GetAllPodcastSeriesAsync();
    Task<PodcastSeries?> GetPodcastSeriesByIdAsync(int seriesId);
    Task<PodcastSeries> CreatePodcastSeriesAsync(PodcastSeries series);
    Task<PodcastSeries> UpdatePodcastSeriesAsync(PodcastSeries series);
    Task RemovePodcastSeriesAsync(PodcastSeries series);

}
