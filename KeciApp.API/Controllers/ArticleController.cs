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
    private readonly IWebHostEnvironment _env;

    public ArticleController(IArticleService articleService, IWebHostEnvironment env)
    {
        _articleService = articleService;
        _env = env;
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

    [HttpGet("articles/{slug}")]
    public async Task<ActionResult<ArticleResponseDTO>> GetArticleBySlug(string slug)
    {
        try
        {
            var article = await _articleService.GetArticleBySlugAsync(slug);
            if (!article.IsPublished)
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
            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }
            var created = await _articleService.AddArticleAsync(request, userId);
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

    [HttpPost("articles/{articleId}/cover")]
    [AuthorizeRoles("admin", "superadmin")]
    [RequestSizeLimit(10_000_000)] // ~10MB
    public async Task<ActionResult<ArticleResponseDTO>> UploadArticleCover(int articleId, IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: jpg, png, webp" });
            }

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(ext))
            {
                ext = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    _ => ".bin"
                };
            }
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "images", "articles");
            if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);
            var fullPath = Path.Combine(uploadsDir, fileName);
            using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var url = $"{baseUrl}/images/articles/{fileName}";
            var updated = await _articleService.SetArticleCoverAsync(articleId, url);
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("articles/asset")]
    [AuthorizeRoles("admin", "superadmin")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult> UploadArticleAsset(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: jpg, png, webp" });
            }

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(ext))
            {
                ext = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    _ => ".bin"
                };
            }
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "images", "articles");
            if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);
            var fullPath = Path.Combine(uploadsDir, fileName);
            using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.PathBase}";
            var url = $"{baseUrl}/images/articles/{fileName}";
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
