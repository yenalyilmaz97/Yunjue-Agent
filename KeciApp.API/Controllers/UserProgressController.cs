using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProgressController : ControllerBase
{
    private readonly IUserProgressService _userProgressService;

    public UserProgressController(IUserProgressService userProgressService)
    {
        _userProgressService = userProgressService;
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserProgressResponseDTO>>> GetAllUserProgressByUserId(int userId)
    {
        try
        {
            var userProgresses = await _userProgressService.GetAllUserProgressByUserIdAsync(userId);
            return Ok(userProgresses);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}/week/{weekId}")]
    public async Task<ActionResult<UserProgressResponseDTO>> GetUserProgressByUserIdAndWeekId(int userId, int weekId)
    {
        try
        {
            var userProgress = await _userProgressService.GetUserProgressByUserIdAndWeekIdAsync(userId, weekId);
            if (userProgress == null)
            {
                return NotFound(new { message = "User progress not found" });
            }
            return Ok(userProgress);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("progress")]
    public async Task<ActionResult<UserProgressResponseDTO>> CreateOrUpdateUserProgress([FromBody] CreateUserProgressRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userProgress = await _userProgressService.CreateOrUpdateUserProgressAsync(request);
            return Ok(userProgress);
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

    [HttpPut("progress")]
    public async Task<ActionResult<UserProgressResponseDTO>> UpdateUserProgress([FromBody] UpdateUserProgressRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userProgress = await _userProgressService.UpdateUserProgressAsync(request);
            return Ok(userProgress);
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

    [HttpDelete("progress/{userProgressId}")]
    public async Task<ActionResult<UserProgressResponseDTO>> DeleteUserProgress(int userProgressId)
    {
        try
        {
            var userProgress = await _userProgressService.DeleteUserProgressAsync(userProgressId);
            return Ok(userProgress);
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

