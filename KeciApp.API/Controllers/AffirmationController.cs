using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AffirmationController : ControllerBase
{
    private readonly IAffirmationsService _affirmationsService;
    private readonly IWebHostEnvironment _env;

    public AffirmationController(IAffirmationsService affirmationService, IWebHostEnvironment env)
    {
        _affirmationsService = affirmationService;
        _env = env;
    }

    [HttpGet("affirmations")]
    public async Task<ActionResult<IEnumerable<AffirmationResponseDTO>>> GetAllFirrmations()
    {
        try
        {
            var affirmations = await _affirmationsService.GetAllAffirmationsAsync();
            return Ok(affirmations);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("affirmation")]
    public async Task<ActionResult<AffirmationResponseDTO>> AddAffirmation([FromBody] CreateAffirmationRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var affirmation = await _affirmationsService.AddAffirmationAsync(request);
            return Ok(affirmation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("affirmation")]
    public async Task<ActionResult<AffirmationResponseDTO>> EditAffirmation([FromBody] EditAffirmationRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var affirmation = await _affirmationsService.EditAffirmationAsync(request);
            return Ok(affirmation);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("affirmations/{affirmationId}")]
    public async Task<ActionResult<AffirmationResponseDTO>> DeleteAffirmation(int affirmationId)
    {
        try
        {
            var affirmation = await _affirmationsService.DeleteAffirmationAsync(affirmationId);
            return Ok(affirmation);
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

    [HttpGet("affirmations/{affirmationId}")]
    public async Task<ActionResult<AffirmationResponseDTO>> GetAffirmationById(int affirmationId)
    {
        try
        {
            var affirmation = await _affirmationsService.GetAffirmationByIdAsync(affirmationId);
            return Ok(affirmation);
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
