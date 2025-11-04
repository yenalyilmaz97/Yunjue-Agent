using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Attributes;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleController : ControllerBase
{
    private readonly IArticleService _articleService;

    public ArticleController(IArticleService articleService)
    {
        _articleService = articleService;
    }
    
    [HttpGet("articles")]
    public async Task<ActionResult<IEnumerable<ArticleResponseDTO>>> GetAllArticles()
    {
        try
        {
            var articles = await _articleService.GetAllArticlesAsync(true);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("articles/all")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<IEnumerable<ArticleResponseDTO>>> GetAllArticlesAdmin()
    {
        try
        {
            var articles = await _articleService.GetAllArticlesAsync(false);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("articles/{articleId}")]
    public async Task<ActionResult<ArticleResponseDTO>> GetArticleById(int articleId)
    {
        try
        {
            var article = await _articleService.GetArticleByIdAsync(articleId);
            if (!article.isActive)
            {
                return NotFound(new { message = "Article not found" });
            }
            return Ok(article);
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

    // Articles - Admin
    [HttpPost("articles")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<ArticleResponseDTO>> CreateArticle([FromBody] CreateArticleRequest request)
    {
        try
        {
            var created = await _articleService.AddArticleAsync(request);
            return Ok(created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("articles")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<ArticleResponseDTO>> EditArticle([FromBody] EditArticleRequest request)
    {
        try
        {
            var updated = await _articleService.EditArticleAsync(request);
            return Ok(updated);
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

    [HttpDelete("articles/{articleId}")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<ArticleResponseDTO>> DeleteArticle(int articleId)
    {
        try
        {
            var deleted = await _articleService.DeleteArticleAsync(articleId);
            return Ok(deleted);
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
