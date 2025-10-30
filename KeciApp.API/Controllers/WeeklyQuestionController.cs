using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;
public class WeeklyQuestionController : ControllerBase
{
    private readonly IWeeklyService _weeklyService;
    private readonly IWeeklyQuestionService _weeklyQuestionService;
    private readonly IWebHostEnvironment _env;

    public WeeklyQuestionController(IWeeklyService weeklyService, IWeeklyQuestionService weeklyQuestionService,
        IWebHostEnvironment env)
    {
        _weeklyService = weeklyService;
        _weeklyQuestionService = weeklyQuestionService;
        _env = env;
    }

    [HttpGet("weekly-questions")]
    public async Task<ActionResult<IEnumerable<WeeklyQuestionResponseDTO>>> GetAllWeeklyQuestions()
    {
        try
        {
            var questions = await _weeklyQuestionService.GetAllWeeklyQuestionsAsync();
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("weekly-questions")]
    public async Task<ActionResult<WeeklyQuestionResponseDTO>> AddWeeklyQuestion([FromBody] CreateWeeklyQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _weeklyQuestionService.AddWeeklyQuestionAsync(request);
            await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(question);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("weekly-questions")]
    public async Task<ActionResult<WeeklyQuestionResponseDTO>> EditWeeklyQuestion([FromBody] EditWeeklyQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _weeklyQuestionService.EditWeeklyQuestionAsync(request);
            return Ok(question);
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
    [HttpDelete("weekly-questions/{weeklyQuestionId}")]
    public async Task<ActionResult<WeeklyQuestionResponseDTO>> DeleteWeeklyQuestion(int weeklyQuestionId)
    {
        try
        {
            var question = await _weeklyQuestionService.DeleteWeeklyQuestionAsync(weeklyQuestionId);
            return Ok(question);
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
    [HttpGet("weekly-questions/{weeklyQuestionId}")]
    public async Task<ActionResult<WeeklyQuestionResponseDTO>> GetWeeklyQuestionById(int weeklyQuestionId)
    {
        try
        {
            var question = await _weeklyQuestionService.GetWeeklyQuestionByIdAsync(weeklyQuestionId);
            return Ok(question);
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
