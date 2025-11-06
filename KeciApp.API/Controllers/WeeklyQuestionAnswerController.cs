using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeeklyQuestionAnswerController : ControllerBase
{
    private readonly IWeeklyQuestionAnswerService _weeklyQuestionAnswerService;
    private readonly IWeeklyQuestionService _weeklyQuestionService;

    public WeeklyQuestionAnswerController(
        IWeeklyQuestionAnswerService weeklyQuestionAnswerService,
        IWeeklyQuestionService weeklyQuestionService)
    {
        _weeklyQuestionAnswerService = weeklyQuestionAnswerService;
        _weeklyQuestionService = weeklyQuestionService;
    }

    [HttpGet("weekly-question-answers")]
    public async Task<ActionResult<IEnumerable<WeeklyQuestionAnswerResponseDTO>>> GetAllWeeklyQuestionAnswers()
    {
        try
        {
            var answers = await _weeklyQuestionAnswerService.GetAllWeeklyQuestionAnswersAsync();
            return Ok(answers);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("weekly-question-answers/{weeklyQuestionAnswerId}")]
    public async Task<ActionResult<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswerById(int weeklyQuestionAnswerId)
    {
        try
        {
            var answer = await _weeklyQuestionAnswerService.GetWeeklyQuestionAnswerByIdAsync(weeklyQuestionAnswerId);
            if (answer == null)
            {
                return NotFound(new { message = "Weekly question answer not found" });
            }
            return Ok(answer);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("weekly-question-answers/user/{userId}")]
    public async Task<ActionResult<IEnumerable<WeeklyQuestionAnswerResponseDTO>>> GetWeeklyQuestionAnswersByUserId(int userId)
    {
        try
        {
            var answers = await _weeklyQuestionAnswerService.GetWeeklyQuestionAnswersByUserIdAsync(userId);
            return Ok(answers);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("weekly-question-answers/question/{weeklyQuestionId}")]
    public async Task<ActionResult<IEnumerable<WeeklyQuestionAnswerResponseDTO>>> GetWeeklyQuestionAnswersByQuestionId(int weeklyQuestionId)
    {
        try
        {
            var answers = await _weeklyQuestionAnswerService.GetWeeklyQuestionAnswersByQuestionIdAsync(weeklyQuestionId);
            return Ok(answers);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("weekly-question-answers/user/{userId}/question/{weeklyQuestionId}")]
    public async Task<ActionResult<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswerByUserIdAndQuestionId(int userId, int weeklyQuestionId)
    {
        try
        {
            var answer = await _weeklyQuestionAnswerService.GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(userId, weeklyQuestionId);
            if (answer == null)
            {
                return NotFound(new { message = "Weekly question answer not found" });
            }
            return Ok(answer);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("weekly-questions/{weeklyQuestionId}")]
    public async Task<ActionResult<WeeklyQuestionResponseDTO>> GetWeeklyQuestion(int weeklyQuestionId)
    {
        try
        {
            var question = await _weeklyQuestionService.GetWeeklyQuestionByIdAsync(weeklyQuestionId);
            if (question == null)
            {
                return NotFound(new { message = "Weekly question not found" });
            }
            return Ok(question);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("weekly-question-answers")]
    public async Task<ActionResult<WeeklyQuestionAnswerResponseDTO>> AnswerWeeklyQuestion([FromBody] AnswerWeeklyQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var answer = await _weeklyQuestionAnswerService.AnswerWeeklyQuestionAsync(request);
            return Ok(answer);
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

    [HttpPut("weekly-question-answers")]
    public async Task<ActionResult<WeeklyQuestionAnswerResponseDTO>> UpdateWeeklyQuestionAnswer([FromBody] UpdateWeeklyQuestionAnswerRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var answer = await _weeklyQuestionAnswerService.UpdateWeeklyQuestionAnswerAsync(request);
            return Ok(answer);
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

    [HttpDelete("weekly-question-answers/{weeklyQuestionAnswerId}")]
    public async Task<ActionResult<WeeklyQuestionAnswerResponseDTO>> DeleteWeeklyQuestionAnswer(int weeklyQuestionAnswerId)
    {
        try
        {
            var answer = await _weeklyQuestionAnswerService.DeleteWeeklyQuestionAnswerAsync(weeklyQuestionAnswerId);
            return Ok(answer);
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

