using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class FavoritesRepository : IFavoritesRepository
{
    private readonly AppDbContext _context;

    public FavoritesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Favorites>> GetAllFavoritePodcastEpisodesByUserIdAsync(int userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.PodcastEpisode)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(f => f.User)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<Favorites?> GetFavoriteAsync(int userId, int episodeId)
    {
        return await _context.Favorites
            .Include(f => f.PodcastEpisode)
            .Include(f => f.User)
            .FirstOrDefaultAsync(f => f.UserId == userId && f.EpisodeId == episodeId);
    }

    public async Task<Favorites> AddToFavoritesAsync(Favorites favorite)
    {
        favorite.CreatedAt = DateTime.UtcNow;

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();

        return await GetFavoriteAsync(favorite.UserId, favorite.EpisodeId) ?? favorite;
    }

    public async Task RemoveFromFavoritesAsync(Favorites favorite)
    {
        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
    }
}
