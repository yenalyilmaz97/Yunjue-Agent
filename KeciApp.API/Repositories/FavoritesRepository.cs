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

    public async Task<IEnumerable<Favorites>> GetAllFavoritesByUserIdAsync(int userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.PodcastEpisode)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(f => f.Article)
            .Include(f => f.Affirmations)
            .Include(f => f.Aphorisms)
            .Include(f => f.User)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<Favorites?> GetFavoriteAsync(int userId, FavoriteType favoriteType, int? episodeId, int? articleId, int? affirmationId, int? aphorismId)
    {
        var query = _context.Favorites
            .Where(f => f.UserId == userId && f.FavoriteType == favoriteType);

        query = favoriteType switch
        {
            FavoriteType.Episode => query.Where(f => f.EpisodeId == episodeId),
            FavoriteType.Article => query.Where(f => f.ArticleId == articleId),
            FavoriteType.Affirmation => query.Where(f => f.AffirmationId == affirmationId),
            FavoriteType.Aphorism => query.Where(f => f.AphorismId == aphorismId),
            _ => query
        };

        return await query
            .Include(f => f.PodcastEpisode)
            .Include(f => f.Article)
            .Include(f => f.Affirmations)
            .Include(f => f.Aphorisms)
            .Include(f => f.User)
            .FirstOrDefaultAsync();
    }

    public async Task<Favorites> AddToFavoritesAsync(Favorites favorite)
    {
        favorite.CreatedAt = DateTime.UtcNow;

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();

        return await GetFavoriteAsync(
            favorite.UserId, 
            favorite.FavoriteType, 
            favorite.EpisodeId, 
            favorite.ArticleId, 
            favorite.AffirmationId, 
            favorite.AphorismId) ?? favorite;
    }

    public async Task RemoveFromFavoritesAsync(Favorites favorite)
    {
        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
    }
}
