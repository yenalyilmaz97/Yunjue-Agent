using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyContentController : ControllerBase
{
    private readonly IDailyContentService _dailyContentService;

    public DailyContentController(IDailyContentService dailyContentService)
    {
        _dailyContentService = dailyContentService;
    }

    [HttpGet("daily-content")]
    public async Task<ActionResult<IEnumerable<DailyContentResponseDTO>>> GetAllDailyContent()
    {
        try
        {
            var content = await _dailyContentService.GetAllDailyContentAsync();
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("daily-content/{dailyContentId}")]
    public async Task<ActionResult<DailyContentResponseDTO>> GetDailyContentById(int dailyContentId)
    {
        try
        {
            var content = await _dailyContentService.GetDailyContentByIdAsync(dailyContentId);
            if (content == null)
            {
                return NotFound(new { message = "Daily content not found" });
            }
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("daily-content/user/{userId}")]
    public async Task<ActionResult<DailyContentResponseDTO>> GetUsersDailyContentOrder(int userId)
    {
        try
        {
            var content = await _dailyContentService.GetUsersDailyContentOrderAsync(userId);
            if (content == null)
            {
                return NotFound(new { message = "Daily content not found for user" });
            }
            return Ok(content);
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

    [HttpPost("daily-content")]
    public async Task<ActionResult<DailyContentResponseDTO>> CreateDailyContent([FromBody] CreateDailyContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var content = await _dailyContentService.CreateDailyContentAsync(request);
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("daily-content")]
    public async Task<ActionResult<DailyContentResponseDTO>> UpdateDailyContent([FromBody] UpdateDailyContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var content = await _dailyContentService.UpdateDailyContentAsync(request);
            return Ok(content);
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

    [HttpDelete("daily-content/{dailyContentId}")]
    public async Task<ActionResult<DailyContentResponseDTO>> DeleteDailyContent(int dailyContentId)
    {
        try
        {
            var content = await _dailyContentService.DeleteDailyContentAsync(dailyContentId);
            return Ok(content);
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

