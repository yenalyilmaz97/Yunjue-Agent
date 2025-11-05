using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AphorismsController : ControllerBase
{
    private readonly IAphorismsService _aphorismsService;
    private readonly IWebHostEnvironment _env;

    public AphorismsController(IAphorismsService aphorismsService, IWebHostEnvironment env)
    {
        _aphorismsService = aphorismsService;
        _env = env;
    }
    
        [HttpGet("aphorisms")]
    public async Task<ActionResult<IEnumerable<AphorismResponseDTO>>> GetAllAphorismsAsync()
    {
        try
        {
            var aphorisms = await _aphorismsService.GetAllAphorismsAsync();
            return Ok(aphorisms);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("aphorism")]
    public async Task<ActionResult<AphorismResponseDTO>> AddAphorism([FromBody] CretaeAphorismRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var aphorism = await _aphorismsService.AddAphorismAsync(request);
            return Ok(aphorism);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("aphorism")]
    public async Task<ActionResult<AphorismResponseDTO>> EditAphorism([FromBody] EditAphorismRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var aphorism = await _aphorismsService.EditAphorismAsync(request);
            return Ok(aphorism);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("aphorisms/{aphorismId}")]
    public async Task<ActionResult<AphorismResponseDTO>> DeleteAphorism(int aphorismId)
    {
        try
        {
            var aphorism = await _aphorismsService.DeleteAphorismAsync(aphorismId);
            return Ok(aphorism);
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

    [HttpGet("aphorisms/{aphorismId}")]
    public async Task<ActionResult<AphorismResponseDTO>> GetAphorismById(int aphorismId)
    {
        try
        {
            var aphorism = await _aphorismsService.GetAphorismByIdAsync(aphorismId);
            return Ok(aphorism);
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
