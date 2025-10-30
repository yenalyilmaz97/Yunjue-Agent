using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IFavoritesRepository
{
    Task<IEnumerable<Favorites>> GetAllFavoritePodcastEpisodesByUserIdAsync(int userId);
    Task<Favorites?> GetFavoriteAsync(int userId, int episodeId);
    Task<Favorites> AddToFavoritesAsync(Favorites favorite);
    Task RemoveFromFavoritesAsync(Favorites favorite);
}
