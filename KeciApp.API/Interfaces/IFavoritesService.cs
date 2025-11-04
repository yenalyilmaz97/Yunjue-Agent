using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IFavoritesService
{
    Task<IEnumerable<FavoriteResponseDTO>> GetAllFavoritesByUserIdAsync(int userId);
    Task<FavoriteResponseDTO> AddToFavoritesAsync(AddToFavoritesRequest request);
    Task<FavoriteResponseDTO> RemoveFromFavoritesAsync(RemoveFromFavoritesRequest request);
}
