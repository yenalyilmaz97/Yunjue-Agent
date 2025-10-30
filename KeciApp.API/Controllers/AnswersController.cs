using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AnswersController : ControllerBase
{
    private readonly IAnswersService _answersService;

    [HttpGet("answers")]
    public async Task<ActionResult<IEnumerable<AnswerResponseDTO>>> GetAllAnswers()
    {
        try
        {
            var answers = await _answersService.GetAllAnswersAsync();
            return Ok(answers);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("answers/question/{questionId}")]
    public async Task<ActionResult<AnswerResponseDTO>> GetAnswerByQuestionId(int questionId)
    {
        try
        {
            var answer = await _answersService.GetAnswerByQuestionIdAsync(questionId);
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



    [HttpPost("answers")]
    public async Task<ActionResult<AnswerResponseDTO>> AnswerQuestion([FromBody] AnswerQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var answer = await _answersService.AnswerQuestionAsync(request);
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

    [HttpPut("answers")]
    public async Task<ActionResult<AnswerResponseDTO>> EditAnswer([FromBody] EditAnswerRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var answer = await _answersService.EditAnswerAsync(request);
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

    [HttpDelete("answers")]
    public async Task<ActionResult<AnswerResponseDTO>> DeleteAnswer([FromBody] DeleteAnswerRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var answer = await _answersService.DeleteAnswerAsync(request);
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
