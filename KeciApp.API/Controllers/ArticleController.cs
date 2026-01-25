using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Attributes;
using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Http;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticleController : ControllerBase
{
    private readonly IArticleService _articleService;
    private readonly IUserSeriesAccessService _userSeriesAccessService;

    public ArticleController(IArticleService articleService, IUserSeriesAccessService userSeriesAccessService)
    {
        _articleService = articleService;
        _userSeriesAccessService = userSeriesAccessService;
    }
    
    [HttpGet("articles")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<IEnumerable<ArticleResponseDTO>>> GetAllArticles()
    {
        try
        {
            // Self-healing: Ensure regular ordering
            await _articleService.EnsureArticleOrdersAsync();

            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out int userId))
            {
                // This should not happen with [Authorize], but handle defensively
                return Unauthorized(new { message = "User not authenticated" });
            }

            var accessDTO = await _userSeriesAccessService.GetCurrentArticleAccessAsync(userId);
            int maxOrder = accessDTO?.CurrentAccessibleSequence ?? 1; // Default to Order 1

            var articles = await _articleService.GetAllArticlesAsync(true);
            var filtered = articles.Where(a => a.Order > 0 && a.Order <= maxOrder);

            return Ok(filtered);
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
    public async Task<ActionResult<ArticleResponseDTO>> CreateArticle([FromForm] CreateArticleWithFileRequest request)
    {
        try
        {
            var createRequest = new CreateArticleRequest
            {
                Title = request.Title,
                PdfLink = request.PdfLink ?? string.Empty,
                isActive = request.isActive
            };

            // If file is provided, upload it first
            if (request.PdfFile != null && request.PdfFile.Length > 0)
            {
                var fileUploadService = HttpContext.RequestServices.GetRequiredService<IFileUploadService>();
                string cdnUrl = await fileUploadService.UploadFileAsync(
                    request.PdfFile,
                    "article",
                    null, // No series for articles
                    request.Title,
                    1 // Default sequence number for articles
                );
                createRequest.PdfLink = cdnUrl;
            }

            // Validate that PdfLink is provided (either from file upload or direct input)
            if (string.IsNullOrWhiteSpace(createRequest.PdfLink))
            {
                return BadRequest(new { message = "PDF file or PDF link is required" });
            }

            var created = await _articleService.AddArticleAsync(createRequest);
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
