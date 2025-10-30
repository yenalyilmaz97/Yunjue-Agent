using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeeklyController : ControllerBase
{
    private readonly IWeeklyService _weeklyService;

    public WeeklyController(IWeeklyService weeklyService)
    {
        _weeklyService = weeklyService;
    }

    [HttpGet("content")]
    public async Task<ActionResult<IEnumerable<WeeklyContentResponseDTO>>> GetAllWeeklyContent()
    {
        try
        {
            var content = await _weeklyService.GetAllWeeklyContentAsync();
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("content/week/{weekId}")]
    public async Task<ActionResult<IEnumerable<WeeklyContentResponseDTO>>> GetAllWeeklyContentByWeekId(int weekId)
    {
        try
        {
            var content = await _weeklyService.GetAllWeeklyContentByWeekIdAsync(weekId);
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("content/user/{userId}")]
    public async Task<ActionResult<IEnumerable<WeeklyContentResponseDTO>>> GetAllWeeklyContentByUserId(int userId)
    {
        try
        {
            var content = await _weeklyService.GetAllWeeklyContentByUserIdAsync(userId);
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

    [HttpPost("content")]
    public async Task<ActionResult<WeeklyContentResponseDTO>> AddWeeklyContent([FromBody] CreateWeeklyContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var content = await _weeklyService.AddWeeklyContentAsync(request);
            return Ok(content);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("content")]
    public async Task<ActionResult<WeeklyContentResponseDTO>> EditWeeklyContent([FromBody] EditWeeklyContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var content = await _weeklyService.EditWeeklyContentAsync(request);
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

    [HttpDelete("content/{weeklyContentId}")]
    public async Task<ActionResult<WeeklyContentResponseDTO>> DeleteWeeklyContent(int weeklyContentId)
    {
        try
        {
            var content = await _weeklyService.DeleteWeeklyContentAsync(weeklyContentId);
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

    [HttpGet("user/{userId}/current")]
    public async Task<ActionResult<WeeklyContentResponseDTO>> GetUserWeeklyContent(int userId)
    {
        try
        {
            var content = await _weeklyService.GetUserWeeklyContentAsync(userId);
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

    [HttpPost("assign")]
    public async Task<ActionResult<WeeklyContentResponseDTO>> AssignWeeklyContentToUser([FromBody] AssignWeeklyContentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var content = await _weeklyService.AssignWeeklyContentToUserAsync(request);
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

    [HttpGet("userweeklyassignment/available-weeks")]
    public async Task<ActionResult<IEnumerable<WeeklyContentResponseDTO>>> GetAvailableWeeks()
    {
        try
        {
            var weeks = await _weeklyService.GetAvailableWeeksAsync();
            return Ok(weeks);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("generate")]
    public async Task<ActionResult<bool>> GenerateWeeklyContent()
    {
        try
        {
            var result = await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}