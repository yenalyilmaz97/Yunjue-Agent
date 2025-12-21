using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Attributes;
using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMoviesService _moviesService;
    private readonly IWeeklyService _weeklyService;
    private readonly IWebHostEnvironment _env;

    public MoviesController(IMoviesService moviesService, IWeeklyService weeklyService, IWebHostEnvironment env)
    {
        _moviesService = moviesService;
        _weeklyService = weeklyService;
        _env = env;
    }

    [HttpGet("movies")]
    public async Task<ActionResult<IEnumerable<MovieResponseDTO>>> GetAllMovies()
    {
        try
        {
            var movies = await _moviesService.GetAllMoviesAsync();
            return Ok(movies);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("movies")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<MovieResponseDTO>> AddMovie([FromForm] CreateMovieRequest request)
    {
        try
        {
            // Check if request is null
            if (request == null)
            {
                return BadRequest(new { message = "Request is null", modelStateKeys = ModelState.Keys.ToList() });
            }

            // Log received data for debugging
            var receivedData = new
            {
                movieTitle = request.MovieTitle,
                hasImageFile = request.ImageFile != null,
                imageFileName = request.ImageFile?.FileName,
                imageFileSize = request.ImageFile?.Length
            };

            // Validate MovieTitle manually
            if (string.IsNullOrWhiteSpace(request.MovieTitle))
            {
                return BadRequest(new { 
                    message = "MovieTitle is required", 
                    receivedData,
                    modelStateErrors = ModelState.Where(x => x.Value?.Errors.Count > 0).ToDictionary(x => x.Key, x => x.Value?.Errors.Select(e => e.ErrorMessage).ToList())
                });
            }

            // Check ModelState for validation errors
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value?.Errors.Select(e => new { Field = x.Key, Error = e.ErrorMessage }))
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors, receivedData });
            }

            var movie = await _moviesService.AddMovieAsync(request);
            await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(movie);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, innerException = ex.InnerException?.Message, stackTrace = ex.StackTrace });
        }
    }
    [HttpPut("movies")]
    public async Task<ActionResult<MovieResponseDTO>> EditMovie([FromBody] EditMovieRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var movie = await _moviesService.EditMovieAsync(request);
            return Ok(movie);
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
    [HttpDelete("movies/{movieId}")]
    public async Task<ActionResult<MovieResponseDTO>> DeleteMovie(int movieId)
    {
        try
        {
            var movie = await _moviesService.DeleteMovieAsync(movieId);
            return Ok(movie);
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
    [HttpGet("movies/{movieId}")]
    public async Task<ActionResult<MovieResponseDTO>> GetMovieById(int movieId)
    {
        try
        {
            var movie = await _moviesService.GetMovieByIdAsync(movieId);
            return Ok(movie);
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

    [HttpPost("movies/{movieId}/image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<MovieResponseDTO>> UploadMovieImage(int movieId, [FromForm] UploadMovieImageRequest request)
    {
        try
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            // Get movie to get title
            var movie = await _moviesService.GetMovieByIdAsync(movieId);
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            // Upload movie image
            var fileUploadService = HttpContext.RequestServices.GetRequiredService<IFileUploadService>();
            string imageUrl = await fileUploadService.UploadMovieImageAsync(request.File, movie.MovieTitle, movieId);

            // Update movie's image URL
            var updatedMovie = await _moviesService.UpdateMovieImageAsync(movieId, imageUrl);
            return Ok(updatedMovie);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
