using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IFavoritesRepository
{
    Task<IEnumerable<Favorites>> GetAllFavoritesByUserIdAsync(int userId);
    Task<Favorites?> GetFavoriteAsync(int userId, FavoriteType favoriteType, int? episodeId, int? articleId, int? affirmationId, int? aphorismId);
    Task<Favorites> AddToFavoritesAsync(Favorites favorite);
    Task RemoveFromFavoritesAsync(Favorites favorite);
}
