using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EpisodesController : ControllerBase
{
    private readonly IPodcastEpisodesService _episodeService;

    public EpisodesController(IPodcastEpisodesService episodeService)
    {
        _episodeService = episodeService;
    }

    [HttpGet("episodes/{episodeId}")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> GetPodcastEpisodeById(int episodeId)
    {
        try
        {
            var episode = await _episodeService.GetPodcastEpisodeByIdAsync(episodeId);
            if (episode == null)
            {
                return NotFound(new { message = "Episode not found" });
            }
            return Ok(episode);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("series/{seriesId}/episodes")]
    public async Task<ActionResult<IEnumerable<PodcastEpisodeResponseDTO>>> GetAllPodcastEpisodesBySeriesId(int seriesId)
    {
        try
        {
            var episodes = await _episodeService.GetAllPodcastEpisodesBySeriesIdAsync(seriesId);
            return Ok(episodes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("episodes")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> CreateNewPodcastEpisode([FromBody] CreatePodcastEpisodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var episode = await _episodeService.CreatePodcastEpisodeAsync(request);
            return Ok(episode);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("episodes")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> UpdatePodcastEpisode([FromBody] EditPodcastEpisodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var episode = await _episodeService.UpdatePodcastEpisodeAsync(request);
            return Ok(episode);
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

    [HttpDelete("episodes/{episodeId}")]
    public async Task<ActionResult> DeletePodcastEpisode(int episodeId)
    {
        try
        {
            await _episodeService.RemovePodcastEpisodeAsync(episodeId);
            return Ok(new { message = "Podcast episode deleted successfully" });
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
    [HttpGet("episodes/eligible/{userId}")]
    public async Task<ActionResult<IEnumerable<PodcastEpisodeResponseDTO>>> GetEligiblePodcastEpisodesByUserId(int userId)
    {
        try
        {
            var episodes = await _episodeService.GetEligiblePodcastEpisodesByUserIdAsync(userId);
            return Ok(episodes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
