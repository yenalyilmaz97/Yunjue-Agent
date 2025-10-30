using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _favoritesService;

    [HttpGet("favorites/{userId}")]
    public async Task<ActionResult<IEnumerable<FavoriteResponseDTO>>> GetAllFavoritePodcastEpisodesByUserId(int userId)
    {
        try
        {
            var favorites = await _favoritesService.GetAllFavoritePodcastEpisodesByUserIdAsync(userId);
            return Ok(favorites);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("favorites")]
    public async Task<ActionResult<FavoriteResponseDTO>> AddToFavorites([FromBody] AddToFavoritesRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var favorite = await _favoritesService.AddToFavoritesAsync(request);
            return Ok(favorite);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("favorites")]
    public async Task<ActionResult<FavoriteResponseDTO>> RemoveFromFavorites([FromBody] RemoveFromFavoritesRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var favorite = await _favoritesService.RemoveFromFavoritesAsync(request);
            return Ok(favorite);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
