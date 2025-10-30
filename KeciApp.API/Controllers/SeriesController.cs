using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class SeriesController : ControllerBase
{
    private readonly IPodcastSeriesService _seriesService;

    [HttpGet("series")]
    public async Task<ActionResult<IEnumerable<PodcastSeriesResponseDTO>>> GetAllPodcastSeries()
    {
        try
        {
            var series = await _seriesService.GetAllPodcastSeriesAsync();
            return Ok(series);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("series/{seriesId}")]
    public async Task<ActionResult<PodcastSeriesResponseDTO>> GetPodcastSeriesById(int seriesId)
    {
        try
        {
            var series = await _seriesService.GetPodcastSeriesByIdAsync(seriesId);
            return Ok(series);
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
    [HttpPost("series")]
    public async Task<ActionResult<PodcastSeriesResponseDTO>> CreateNewPodcastSeries([FromBody] CreatePodcastSeriesRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var series = await _seriesService.CreatePodcastSeriesAsync(request);
            return Ok(series);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("series")]
    public async Task<ActionResult<PodcastSeriesResponseDTO>> UpdatePodcastSeries([FromBody] EditPodcastSeriesRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var series = await _seriesService.UpdatePodcastSeriesAsync(request);
            return Ok(series);
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

    [HttpDelete("series/{seriesId}")]
    public async Task<ActionResult> DeletePodcastSeries(int seriesId)
    {
        try
        {
            await _seriesService.RemovePodcastSeriesAsync(seriesId);
            return Ok(new { message = "Podcast series deleted successfully" });
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
