using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PopupController : ControllerBase
{
    private readonly IPopupService _popupService;

    public PopupController(IPopupService popupService)
    {
        _popupService = popupService;
    }

    /// <summary>
    /// Gets the active popup for the current user. Returns 204 No Content if no popup to show.
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PopupResponseDTO>> GetActivePopup()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var popup = await _popupService.GetActivePopupForUserAsync(userId);

        if (popup == null)
        {
            return NoContent();
        }

        return Ok(new PopupResponseDTO
        {
            Id = popup.Id,
            Title = popup.Title,
            ImageUrl = popup.ImageUrl,
            Repeatable = popup.Repeatable,
            IsActive = popup.IsActive,
            CreatedAt = popup.CreatedAt
        });
    }

    /// <summary>
    /// Marks the active popup as seen for the current user.
    /// </summary>
    [HttpPost("seen")]
    [Authorize]
    public async Task<IActionResult> MarkPopupAsSeen()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        await _popupService.MarkPopupAsSeenAsync(userId);
        return Ok(new { message = "Popup marked as seen." });
    }

    /// <summary>
    /// Gets all popups (Admin only).
    /// </summary>
    [HttpGet("admin/all")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<ActionResult<List<PopupResponseDTO>>> GetAllPopups()
    {
        var popups = await _popupService.GetAllPopupsAsync();
        return Ok(popups.Select(p => new PopupResponseDTO
        {
            Id = p.Id,
            Title = p.Title,
            ImageUrl = p.ImageUrl,
            Repeatable = p.Repeatable,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt
        }));
    }

    /// <summary>
    /// Creates a new active popup. Deactivates existing ones and resets user seen status.
    /// </summary>
    [HttpPost("admin")]
    [Authorize(Roles = "admin,superadmin")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PopupResponseDTO>> CreatePopup([FromForm] CreatePopupRequest request)
    {
        var createdPopup = await _popupService.CreatePopupAsync(request.Title, request.Image, request.Repeatable);

        return Ok(new PopupResponseDTO
        {
            Id = createdPopup.Id,
            Title = createdPopup.Title,
            ImageUrl = createdPopup.ImageUrl,
            Repeatable = createdPopup.Repeatable,
            IsActive = createdPopup.IsActive,
            CreatedAt = createdPopup.CreatedAt
        });
    }

    /// <summary>
    /// Updates an existing popup.
    /// </summary>
    [HttpPut("admin/{id}")]
    [Authorize(Roles = "admin,superadmin")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PopupResponseDTO>> UpdatePopup(int id, [FromForm] UpdatePopupRequest request)
    {
        try 
        {
            var updatedPopup = await _popupService.UpdatePopupAsync(id, request.Title, request.Image, request.Repeatable);

            return Ok(new PopupResponseDTO
            {
                Id = updatedPopup.Id,
                Title = updatedPopup.Title,
                ImageUrl = updatedPopup.ImageUrl,
                Repeatable = updatedPopup.Repeatable,
                IsActive = updatedPopup.IsActive,
                CreatedAt = updatedPopup.CreatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Activates a popup and resets user views.
    /// </summary>
    [HttpPost("admin/{id}/activate")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> ActivatePopup(int id)
    {
        try
        {
            await _popupService.ActivatePopupAsync(id);
            return Ok(new { message = "Popup activated and user views reset." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a popup.
    /// </summary>
    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "admin,superadmin")]
    public async Task<IActionResult> DeletePopup(int id)
    {
        try
        {
            await _popupService.DeletePopupAsync(id);
            return Ok(new { message = "Popup deleted." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }
}
