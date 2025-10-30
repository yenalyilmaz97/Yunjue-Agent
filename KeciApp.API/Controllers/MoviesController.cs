using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Attributes;
using KeciApp.API.Interfaces;

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
    public async Task<ActionResult<MovieResponseDTO>> AddMovie([FromBody] CreateMovieRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var movie = await _moviesService.AddMovieAsync(request);
            await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(movie);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
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
}
