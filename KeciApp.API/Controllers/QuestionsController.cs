using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

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

    [HttpGet("questions/article/{articleId}")]
    public async Task<ActionResult<IEnumerable<QuestionResponseDTO>>> GetQuestionsByArticleId(int articleId)
    {
        try
        {
            var questions = await _questionService.GetQuestionsByArticleIdAsync(articleId);
            return Ok(questions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("questions/user/{userId}/article/{articleId}")]
    public async Task<ActionResult<QuestionResponseDTO>> GetQuestionByUserIdAndArticleId(int userId, int articleId)
    {
        try
        {
            var question = await _questionService.GetQuestionByUserIdAndArticleIdAsync(userId, articleId);
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
    public async Task<ActionResult<QuestionResponseDTO>> AddQuestion([FromBody] AddQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _questionService.AddQuestionAsync(request);
            return Ok(question);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }





    [HttpDelete("questions/{questionId}")]
    public async Task<ActionResult<bool>> DeleteQuestion(int questionId)
    {
        try
        {
            var result = await _questionService.DeleteQuestionAsync(questionId);
            if (!result)
            {
                return NotFound(new { message = "Question not found" });
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("questions/edit")]
    public async Task<ActionResult<QuestionResponseDTO>> EditQuestion([FromBody] EditQuestionRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var question = await _questionService.UpdateQuestionAsync(request);
            return Ok(question);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
