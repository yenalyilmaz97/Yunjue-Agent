using KeciApp.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")] // Restrict to admins
public class ContentUpdateBatchController : ControllerBase
{
    private readonly IContentUpdateBatchService _service;

    public ContentUpdateBatchController(IContentUpdateBatchService service)
    {
        _service = service;
    }

    /// <summary>
    /// Gets the recent content update batches (history of bulk updates).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetRecentBatches([FromQuery] int count = 20)
    {
        var batches = await _service.GetRecentBatchesAsync(count);
        return Ok(batches);
    }

    /// <summary>
    /// Exports the details of a specific update batch as a PDF.
    /// </summary>
    [HttpGet("{batchId}/pdf")]
    public async Task<IActionResult> ExportBatchPdf(Guid batchId)
    {
        try
        {
            var pdfBytes = await _service.GeneratePdfForBatchAsync(batchId);
            return File(pdfBytes, "application/pdf", $"update_report_{batchId}.pdf");
        }
        catch (FileNotFoundException)
        {
            return NotFound("Batch not found.");
        }
    }
}
