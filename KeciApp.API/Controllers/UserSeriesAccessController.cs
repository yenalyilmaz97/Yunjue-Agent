using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using KeciApp.API.Attributes;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class UserSeriesAccessController : ControllerBase
{
    private readonly IUserSeriesAccessService _userSeriesAccessService;

    public UserSeriesAccessController(IUserSeriesAccessService userSeriesAccessService)
    {
        _userSeriesAccessService = userSeriesAccessService;
    }

    [HttpGet("userseriesaccess")]
    public async Task<ActionResult<IEnumerable<UserSeriesAccessResponseDTO>>> GetAllUserSeriesAccess()
    {
        try
        {
            var accessRecords = await _userSeriesAccessService.GetAllUserSeriesAccessAsync();
            return Ok(accessRecords);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("userseriesaccess/{id}")]
    public async Task<ActionResult<UserSeriesAccessResponseDTO>> GetUserSeriesAccessById(int id)
    {
        try
        {
            var access = await _userSeriesAccessService.GetUserSeriesAccessByIdAsync(id);
            return Ok(access);
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

    [HttpGet("userseriesaccess/user/{userId}/series/{seriesId}")]
    public async Task<ActionResult<UserSeriesAccessResponseDTO>> GetUserSeriesAccessByUserIdAndSeriesId(int userId, int seriesId)
    {
        try
        {
            var access = await _userSeriesAccessService.GetUserSeriesAccessByUserIdAndSeriesIdAsync(userId, seriesId);
            return Ok(access);
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

    [HttpGet("userseriesaccess/user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserSeriesAccessResponseDTO>>> GetUserSeriesAccessByUserId(int userId)
    {
        try
        {
            var accessRecords = await _userSeriesAccessService.GetUserSeriesAccessByUserIdAsync(userId);
            return Ok(accessRecords);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("userseriesaccess/stats")]
    public async Task<ActionResult<UserSeriesAccessStatsDTO>> GetUserSeriesAccessStats()
    {
        try
        {
            var stats = await _userSeriesAccessService.GetUserSeriesAccessStatsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("userseriesaccess")]
    public async Task<ActionResult<UserSeriesAccessResponseDTO>> CreateUserSeriesAccess([FromBody] CreateUserSeriesAccessRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var access = await _userSeriesAccessService.CreateUserSeriesAccessAsync(request);
            return Ok(access);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("userseriesaccess/{id}")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<UserSeriesAccessResponseDTO>> UpdateUserSeriesAccess(int id, [FromBody] UpdateUserSeriesAccessRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var access = await _userSeriesAccessService.UpdateUserSeriesAccessAsync(id, request);
            return Ok(access);
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

    [HttpDelete("userseriesaccess/{id}")]
    public async Task<ActionResult> DeleteUserSeriesAccess(int id)
    {
        try
        {
            await _userSeriesAccessService.DeleteUserSeriesAccessAsync(id);
            return Ok(new { message = "User series access deleted successfully" });
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

    [HttpPost("userseriesaccess/grant")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<UserSeriesAccessResponseDTO>> GrantAccess([FromBody] GrantAccessRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var access = await _userSeriesAccessService.GrantAccessAsync(request);
            return Ok(access);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("userseriesaccess/revoke")]
    public async Task<ActionResult> RevokeAccess([FromBody] RevokeAccessRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _userSeriesAccessService.RevokeAccessAsync(request);
            return Ok(new { message = "Access revoked successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("download-audio")]
    public async Task<IActionResult> DownloadAudioFromGoogleDrive([FromBody] DownloadAudioRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.GoogleDriveUrl))
            {
                return BadRequest(new { message = "Google Drive URL is required" });
            }

            // Extract file ID from Google Drive URL
            string fileId = null;
            if (request.GoogleDriveUrl.Contains("/file/d/"))
            {
                var match = System.Text.RegularExpressions.Regex.Match(request.GoogleDriveUrl, @"/file/d/([^/]+)");
                if (match.Success)
                {
                    fileId = match.Groups[1].Value;
                }
            }

            if (string.IsNullOrEmpty(fileId))
            {
                return BadRequest(new { message = "Could not extract file ID from Google Drive URL" });
            }

            // Create wwwroot/audio directory if it doesn't exist
            var audioDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio");
            Directory.CreateDirectory(audioDir);

            var audioFilePath = Path.Combine(audioDir, $"{fileId}.mp3");

            // Check if file already exists
            if (System.IO.File.Exists(audioFilePath))
            {
                return Ok(new
                {
                    message = "Audio file already exists",
                    fileId = fileId,
                    url = $"/audio/{fileId}.mp3"
                });
            }

            // Download from Google Drive
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

                // Try direct download URL
                var downloadUrl = $"https://drive.google.com/uc?export=download&id={fileId}";
                var response = await httpClient.GetAsync(downloadUrl);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsByteArrayAsync();

                    // Check if it's actually an audio file (not HTML error page)
                    if (content.Length > 1000 && !System.Text.Encoding.UTF8.GetString(content).Contains("<!DOCTYPE html>"))
                    {
                        await System.IO.File.WriteAllBytesAsync(audioFilePath, content);

                        return Ok(new
                        {
                            message = "Audio file downloaded successfully",
                            fileId = fileId,
                            url = $"/audio/{fileId}.mp3",
                            size = content.Length
                        });
                    }
                    else
                    {
                        return BadRequest(new { message = "Failed to download audio file. The file might be too large or restricted." });
                    }
                }
                else
                {
                    return BadRequest(new { message = $"Failed to download audio file. Status: {response.StatusCode}" });
                }
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("audio/{fileId}")]
    public IActionResult GetAudioFile(string fileId)
    {
        try
        {
            var audioPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "audio", $"{fileId}.mp3");

            if (!System.IO.File.Exists(audioPath))
            {
                return NotFound(new { message = "Audio file not found" });
            }

            var audioBytes = System.IO.File.ReadAllBytes(audioPath);
            return File(audioBytes, "audio/mpeg", $"{fileId}.mp3");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}

public class DownloadAudioRequest
{
    public string GoogleDriveUrl { get; set; } = string.Empty;
}
