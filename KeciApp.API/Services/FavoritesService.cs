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

    public async Task<IEnumerable<FavoriteResponseDTO>> GetAllFavoritesByUserIdAsync(int userId)
    {
        var favorites = await _favoritesRepository.GetAllFavoritesByUserIdAsync(userId);
        var responseDtos = _mapper.Map<IEnumerable<FavoriteResponseDTO>>(favorites);

        // Set related data manually
        foreach (var responseDto in responseDtos)
        {
            var favorite = favorites.FirstOrDefault(f => f.FavoriteId == responseDto.FavoriteId);
            if (favorite != null)
            {
                responseDto.UserName = favorite.User?.UserName ?? string.Empty;

                switch (favorite.FavoriteType)
                {
                    case FavoriteType.Episode:
                        if (favorite.PodcastEpisode != null)
                        {
                            responseDto.EpisodeTitle = favorite.PodcastEpisode.Title;
                            responseDto.SeriesTitle = favorite.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
                        }
                        break;
                    case FavoriteType.Article:
                        if (favorite.Article != null)
                        {
                            responseDto.ArticleTitle = favorite.Article.Title;
                        }
                        break;
                    case FavoriteType.Affirmation:
                        if (favorite.Affirmations != null)
                        {
                            responseDto.AffirmationText = favorite.Affirmations.Text;
                        }
                        break;
                    case FavoriteType.Aphorism:
                        if (favorite.Aphorisms != null)
                        {
                            responseDto.AphorismText = favorite.Aphorisms.Text;
                        }
                        break;
                }
            }
        }

        return responseDtos;
    }

    public async Task<FavoriteResponseDTO> AddToFavoritesAsync(AddToFavoritesRequest request)
    {
        // Validate that the correct ID is provided based on FavoriteType
        ValidateFavoriteRequest(request);

        // Check if already exists
        var existingFavorite = await _favoritesRepository.GetFavoriteAsync(
            request.UserId, 
            request.FavoriteType, 
            request.EpisodeId, 
            request.ArticleId, 
            request.AffirmationId, 
            request.AphorismId);
        
        if (existingFavorite != null)
        {
            throw new InvalidOperationException("Item is already in favorites");
        }

        var favorite = new Favorites
        {
            UserId = request.UserId,
            FavoriteType = request.FavoriteType,
            EpisodeId = request.EpisodeId,
            ArticleId = request.ArticleId,
            AffirmationId = request.AffirmationId,
            AphorismId = request.AphorismId
        };

        var addedFavorite = await _favoritesRepository.AddToFavoritesAsync(favorite);
        var responseDto = _mapper.Map<FavoriteResponseDTO>(addedFavorite);
        
        // Set related data
        if (addedFavorite.PodcastEpisode != null)
        {
            responseDto.EpisodeTitle = addedFavorite.PodcastEpisode.Title;
            responseDto.SeriesTitle = addedFavorite.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
        }
        if (addedFavorite.Article != null)
        {
            responseDto.ArticleTitle = addedFavorite.Article.Title;
        }
        if (addedFavorite.Affirmations != null)
        {
            responseDto.AffirmationText = addedFavorite.Affirmations.Text;
        }
        if (addedFavorite.Aphorisms != null)
        {
            responseDto.AphorismText = addedFavorite.Aphorisms.Text;
        }
        responseDto.UserName = addedFavorite.User?.UserName ?? string.Empty;

        return responseDto;
    }

    public async Task<FavoriteResponseDTO> RemoveFromFavoritesAsync(RemoveFromFavoritesRequest request)
    {
        ValidateFavoriteRequest(request);

        var favorite = await _favoritesRepository.GetFavoriteAsync(
            request.UserId, 
            request.FavoriteType, 
            request.EpisodeId, 
            request.ArticleId, 
            request.AffirmationId, 
            request.AphorismId);
        
        if (favorite == null)
        {
            throw new InvalidOperationException("Favorite not found");
        }

        await _favoritesRepository.RemoveFromFavoritesAsync(favorite);
        var responseDto = _mapper.Map<FavoriteResponseDTO>(favorite);
        
        // Set related data
        if (favorite.PodcastEpisode != null)
        {
            responseDto.EpisodeTitle = favorite.PodcastEpisode.Title;
            responseDto.SeriesTitle = favorite.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
        }
        if (favorite.Article != null)
        {
            responseDto.ArticleTitle = favorite.Article.Title;
        }
        if (favorite.Affirmations != null)
        {
            responseDto.AffirmationText = favorite.Affirmations.Text;
        }
        if (favorite.Aphorisms != null)
        {
            responseDto.AphorismText = favorite.Aphorisms.Text;
        }
        responseDto.UserName = favorite.User?.UserName ?? string.Empty;

        return responseDto;
    }

    private static void ValidateFavoriteRequest(AddToFavoritesRequest request)
    {
        switch (request.FavoriteType)
        {
            case FavoriteType.Episode:
                if (!request.EpisodeId.HasValue)
                    throw new ArgumentException("EpisodeId is required for Episode favorites");
                break;
            case FavoriteType.Article:
                if (!request.ArticleId.HasValue)
                    throw new ArgumentException("ArticleId is required for Article favorites");
                break;
            case FavoriteType.Affirmation:
                if (!request.AffirmationId.HasValue)
                    throw new ArgumentException("AffirmationId is required for Affirmation favorites");
                break;
            case FavoriteType.Aphorism:
                if (!request.AphorismId.HasValue)
                    throw new ArgumentException("AphorismId is required for Aphorism favorites");
                break;
        }
    }

    private static void ValidateFavoriteRequest(RemoveFromFavoritesRequest request)
    {
        switch (request.FavoriteType)
        {
            case FavoriteType.Episode:
                if (!request.EpisodeId.HasValue)
                    throw new ArgumentException("EpisodeId is required for Episode favorites");
                break;
            case FavoriteType.Article:
                if (!request.ArticleId.HasValue)
                    throw new ArgumentException("ArticleId is required for Article favorites");
                break;
            case FavoriteType.Affirmation:
                if (!request.AffirmationId.HasValue)
                    throw new ArgumentException("AffirmationId is required for Affirmation favorites");
                break;
            case FavoriteType.Aphorism:
                if (!request.AphorismId.HasValue)
                    throw new ArgumentException("AphorismId is required for Aphorism favorites");
                break;
        }
    }
}
