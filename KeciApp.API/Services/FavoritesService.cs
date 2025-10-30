using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class FavoritesService : IFavoritesService
{
    private readonly IFavoritesRepository _favoritesRepository;
    private readonly IMapper _mapper;

    public FavoritesService(IFavoritesRepository favoritesRepository, IMapper mapper)
    {
        _favoritesRepository = favoritesRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<FavoriteResponseDTO>> GetAllFavoritePodcastEpisodesByUserIdAsync(int userId)
    {
        var favorites = await _favoritesRepository.GetAllFavoritePodcastEpisodesByUserIdAsync(userId);
        var responseDtos = _mapper.Map<IEnumerable<FavoriteResponseDTO>>(favorites);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var favorite = favorites.FirstOrDefault(f => f.FavoriteId == responseDto.FavoriteId);
            if (favorite?.PodcastEpisode != null)
            {
                responseDto.SeriesTitle = favorite.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = favorite.PodcastEpisode.Title;
            }
        }

        return responseDtos;
    }
    public async Task<FavoriteResponseDTO> AddToFavoritesAsync(AddToFavoritesRequest request)
    {
        // Check if already exists
        var existingFavorite = await _favoritesRepository.GetFavoriteAsync(request.UserId, request.EpisodeId);
        if (existingFavorite != null)
        {
            throw new InvalidOperationException("Episode is already in favorites");
        }

        var favorite = new Favorites
        {
            UserId = request.UserId,
            EpisodeId = request.EpisodeId
        };

        var addedFavorite = await _favoritesRepository.AddToFavoritesAsync(favorite);
        return _mapper.Map<FavoriteResponseDTO>(addedFavorite);
    }
    public async Task<FavoriteResponseDTO> RemoveFromFavoritesAsync(RemoveFromFavoritesRequest request)
    {
        var favorite = await _favoritesRepository.GetFavoriteAsync(request.UserId, request.EpisodeId);
        if (favorite == null)
        {
            throw new InvalidOperationException("Favorite not found");
        }

        await _favoritesRepository.RemoveFromFavoritesAsync(favorite);
        return _mapper.Map<FavoriteResponseDTO>(favorite);
    }
}
