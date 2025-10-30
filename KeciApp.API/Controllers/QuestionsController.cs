using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;


    [HttpGet("questions")]
    public async Task<ActionResult<IEnumerable<QuestionResponseDTO>>> GetAllQuestions()
    {
        try
        {
            var questions = await _questionService.GetAllQuestionsAsync();
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("questions/user/{userId}")]
    public async Task<ActionResult<IEnumerable<QuestionResponseDTO>>> GetAllQuestionsByUserId(int userId)
    {
        try
        {
            var questions = await _questionService.GetAllQuestionsByUserIdAsync(userId);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("questions/episode/{episodeId}")]
    public async Task<ActionResult<IEnumerable<QuestionResponseDTO>>> GetQuestionsByEpisodeId(int episodeId)
    {
        try
        {
            var questions = await _questionService.GetQuestionsByEpisodeIdAsync(episodeId);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("questions/user/{userId}/episode/{episodeId}")]
    public async Task<ActionResult<QuestionResponseDTO>> GetQuestionByUserIdAndEpisodeId(int userId, int episodeId)
    {
        try
        {
            var question = await _questionService.GetQuestionByUserIdAndEpisodeIdAsync(userId, episodeId);
            if (question == null)
            {
                return NotFound(new { message = "Question not found" });
            }
            return Ok(question);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("questions")]
    public async Task<ActionResult<QuestionResponseDTO>> AddQuestionToPodcastEpisode([FromBody] AddQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _questionService.AddQuestionToPodcastEpisodeAsync(request);
            return Ok(question);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("questions")]
    public async Task<ActionResult<QuestionResponseDTO>> EditQuestionOfPodcastEpisode([FromBody] EditQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _questionService.EditQuestionOfPodcastEpisodeAsync(request);
            return Ok(question);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("questions/{questionId}")]
    public async Task<ActionResult<QuestionResponseDTO>> UpdateQuestion(int questionId, [FromBody] UpdateQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            request.QuestionId = questionId;
            var question = await _questionService.UpdateQuestionAsync(request);
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
