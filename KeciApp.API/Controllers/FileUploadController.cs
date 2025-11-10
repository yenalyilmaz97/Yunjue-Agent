using Microsoft.AspNetCore.Mvc;
using KeciApp.API.Interfaces;
using KeciApp.API.Attributes;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileUploadController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;

    public FileUploadController(IFileUploadService fileUploadService)
    {
        _fileUploadService = fileUploadService;
    }

    [HttpPost("upload")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] FileUploadRequest request)
    {
        try
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            if (string.IsNullOrWhiteSpace(request.ContentType))
            {
                return BadRequest(new { message = "ContentType is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { message = "Title is required" });
            }

            // Validate contentType
            if (request.ContentType != "article" && request.ContentType != "podcast-episode")
            {
                return BadRequest(new { message = "ContentType must be 'article' or 'podcast-episode'" });
            }

            // Validate seriesTitle for podcast-episode
            if (request.ContentType == "podcast-episode" && string.IsNullOrWhiteSpace(request.SeriesTitle))
            {
                return BadRequest(new { message = "SeriesTitle is required for podcast-episode" });
            }

            string cdnUrl = await _fileUploadService.UploadFileAsync(
                request.File,
                request.ContentType,
                request.SeriesTitle,
                request.Title,
                request.SequenceNumber
            );

            return Ok(new FileUploadResponse
            {
                Url = cdnUrl,
                Message = "File uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while uploading the file", error = ex.Message });
        }
    }

    [HttpDelete("delete")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult> DeleteFile([FromBody] FileDeleteRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FileUrl))
            {
                return BadRequest(new { message = "FileUrl is required" });
            }

            bool deleted = await _fileUploadService.DeleteFileAsync(request.FileUrl);

            if (deleted)
            {
                return Ok(new { message = "File deleted successfully" });
            }
            else
            {
                return NotFound(new { message = "File not found or could not be deleted" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the file", error = ex.Message });
        }
    }
}

// Request/Response DTOs
public class FileUploadRequest
{
    public IFormFile File { get; set; }
    public string ContentType { get; set; } // "article" or "podcast-episode"
    public string? SeriesTitle { get; set; } // Required for podcast-episode
    public string Title { get; set; } // Episode/Article title
    public int SequenceNumber { get; set; } = 1; // Default to 1
}

public class FileUploadResponse
{
    public string Url { get; set; }
    public string Message { get; set; }
}

public class FileDeleteRequest
{
    public string FileUrl { get; set; }
}

