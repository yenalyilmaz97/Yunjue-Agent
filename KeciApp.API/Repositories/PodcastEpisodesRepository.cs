using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class PodcastEpisodesRepository : IPodcastEpisodesRepository
{
    private readonly AppDbContext _context;

    public PodcastEpisodesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PodcastEpisodes>> GetAllPodcastEpisodesBySeriesIdAsync(int seriesId)
    {
        return await _context.PodcastEpisodes
            .Where(pe => pe.SeriesId == seriesId)
            .Include(pe => pe.PodcastSeries)
            .OrderBy(pe => pe.SequenceNumber)
            .ToListAsync();
    }

    public async Task<IEnumerable<PodcastEpisodes>> GetEligiblePodcastEpisodesByUserIdAsync(int userId)
    {
        var userAccesses = await _context.UserSeriesAccesses
            .Where(usa => usa.UserId == userId)
            .ToListAsync();

        var eligibleEpisodes = new List<PodcastEpisodes>();

        foreach (var access in userAccesses)
        {
            var episodes = await _context.PodcastEpisodes
                .Where(pe => pe.SeriesId == access.SeriesId &&
                           pe.SequenceNumber <= access.CurrentAccessibleSequence &&
                           pe.isActive)
                .Include(pe => pe.PodcastSeries)
                .OrderBy(pe => pe.SequenceNumber)
                .ToListAsync();
            eligibleEpisodes.AddRange(episodes);
        }

        return eligibleEpisodes;
    }

    public async Task<PodcastEpisodes?> GetPodcastEpisodeByIdAsync(int? episodeId)
    {
        return await _context.PodcastEpisodes
            .Include(pe => pe.PodcastSeries)
            .FirstOrDefaultAsync(pe => pe.EpisodesId == episodeId);
    }

    public async Task<PodcastEpisodes> CreatePodcastEpisodeAsync(PodcastEpisodes episode)
    {
        episode.CreatedAt = DateTime.UtcNow;
        episode.UpdatedAt = DateTime.UtcNow;

        _context.PodcastEpisodes.Add(episode);
        await _context.SaveChangesAsync();

        return await GetPodcastEpisodeByIdAsync(episode.EpisodesId) ?? episode;
    }

    public async Task<int> GetMaxEpisodeSequenceAsync(int seriesId)
    {
        var hasAny = await _context.PodcastEpisodes.AnyAsync(pe => pe.SeriesId == seriesId);
        if (!hasAny) return 0;
        return await _context.PodcastEpisodes
            .Where(pe => pe.SeriesId == seriesId)
            .MaxAsync(pe => pe.SequenceNumber);
    }

    public async Task<PodcastEpisodes> UpdatePodcastEpisodeAsync(PodcastEpisodes episode)
    {
        episode.UpdatedAt = DateTime.UtcNow;

        _context.PodcastEpisodes.Update(episode);
        await _context.SaveChangesAsync();

        return await GetPodcastEpisodeByIdAsync(episode.EpisodesId) ?? episode;
    }

    public async Task RemovePodcastEpisodeAsync(PodcastEpisodes episode)
    {
        _context.PodcastEpisodes.Remove(episode);
        await _context.SaveChangesAsync();
    }
}
