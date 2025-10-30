using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class MusicController : ControllerBase
{
    private readonly IMusicService _musicService;
    private readonly IWeeklyService  _weeklyService;
    private readonly IWebHostEnvironment _env;

    public MusicController(IMusicService musicService, IWeeklyService weeklyService, IWebHostEnvironment env)
    {
        _musicService = musicService;
        _weeklyService = weeklyService;
        _env = env;
    }

    [HttpGet("music")]
    public async Task<ActionResult<IEnumerable<MusicResponseDTO>>> GetAllMusic()
    {
        try
        {
            var music = await _musicService.GetAllMusicAsync();
            return Ok(music);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("music")]
    public async Task<ActionResult<MusicResponseDTO>> AddMusic([FromBody] CreateMusicRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var music = await _musicService.AddMusicAsync(request);
            await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(music);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("music")]
    public async Task<ActionResult<MusicResponseDTO>> EditMusic([FromBody] EditMusicRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var music = await _musicService.EditMusicAsync(request);
            return Ok(music);
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
    [HttpDelete("music/{musicId}")]
    public async Task<ActionResult<MusicResponseDTO>> DeleteMusic(int musicId)
    {
        try
        {
            var music = await _musicService.DeleteMusicAsync(musicId);
            return Ok(music);
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

    [HttpGet("music/{musicId}")]
    public async Task<ActionResult<MusicResponseDTO>> GetMusicById(int musicId)
    {
        try
        {
            var music = await _musicService.GetMusicByIdAsync(musicId);
            return Ok(music);
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
