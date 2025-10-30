using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class PodcastSeriesRepository : IPodcastSeriesRepository
{
    private readonly AppDbContext _context;

    public PodcastSeriesRepository(AppDbContext context)    {
        _context = context;
    }
     public async Task<IEnumerable<PodcastSeries>> GetAllPodcastSeriesAsync()
    {
        return await _context.PodcastSeries
            .Include(ps => ps.Episodes)
            .ToListAsync();
    }

    public async Task<PodcastSeries?> GetPodcastSeriesByIdAsync(int seriesId)
    {
        return await _context.PodcastSeries
            .Include(ps => ps.Episodes)
            .FirstOrDefaultAsync(ps => ps.SeriesId == seriesId);
    }

    public async Task<PodcastSeries> CreatePodcastSeriesAsync(PodcastSeries series)
    {
        series.CreatedAt = DateTime.UtcNow;
        series.UpdatedAt = DateTime.UtcNow;
        
        _context.PodcastSeries.Add(series);
        await _context.SaveChangesAsync();
        
        return await GetPodcastSeriesByIdAsync(series.SeriesId) ?? series;
    }

    public async Task<PodcastSeries> UpdatePodcastSeriesAsync(PodcastSeries series)
    {
        series.UpdatedAt = DateTime.UtcNow;
        
        _context.PodcastSeries.Update(series);
        await _context.SaveChangesAsync();
        
        return await GetPodcastSeriesByIdAsync(series.SeriesId) ?? series;
    }

    public async Task RemovePodcastSeriesAsync(PodcastSeries series)
    {
        _context.PodcastSeries.Remove(series);
        await _context.SaveChangesAsync();
    }
}
