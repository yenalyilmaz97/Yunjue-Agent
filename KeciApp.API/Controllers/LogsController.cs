using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KeciApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class LogsController : ControllerBase
{
    private readonly IApiLogRepository _logRepository;
    private readonly ILogger<LogsController> _logger;

    // Default retention period in days
    private const int DefaultRetentionDays = 30;

    public LogsController(IApiLogRepository logRepository, ILogger<LogsController> logger)
    {
        _logRepository = logRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all API logs with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<LogsPagedResponse>> GetLogs(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 50;

        var logs = await _logRepository.GetLogsAsync(page, pageSize);
        var totalCount = await _logRepository.GetTotalCountAsync();

        return Ok(new LogsPagedResponse
        {
            Logs = logs,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Get only error logs (status >= 400 or has error message)
    /// </summary>
    [HttpGet("errors")]
    public async Task<ActionResult<LogsPagedResponse>> GetErrorLogs(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 50;

        var logs = await _logRepository.GetErrorLogsAsync(page, pageSize);
        var totalCount = await _logRepository.GetErrorCountAsync();

        return Ok(new LogsPagedResponse
        {
            Logs = logs,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    /// <summary>
    /// Get a specific log by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiLog>> GetLogById(long id)
    {
        var log = await _logRepository.GetLogByIdAsync(id);
        if (log == null)
        {
            return NotFound();
        }
        return Ok(log);
    }

    /// <summary>
    /// Get logs within a date range
    /// </summary>
    [HttpGet("range")]
    public async Task<ActionResult<LogsPagedResponse>> GetLogsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 50;

        var logs = await _logRepository.GetLogsByDateRangeAsync(startDate, endDate, page, pageSize);
        
        return Ok(new LogsPagedResponse
        {
            Logs = logs,
            TotalCount = logs.Count(),
            Page = page,
            PageSize = pageSize,
            TotalPages = 1 // Simplified for date range queries
        });
    }

    /// <summary>
    /// Preview how many logs would be deleted (does not delete)
    /// </summary>
    [HttpGet("cleanup/preview")]
    public async Task<ActionResult<CleanupPreviewResponse>> PreviewCleanup(
        [FromQuery] int retentionDays = DefaultRetentionDays)
    {
        if (retentionDays < 1) retentionDays = DefaultRetentionDays;

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
        var count = await _logRepository.GetLogsCountOlderThanAsync(cutoffDate);
        var totalCount = await _logRepository.GetTotalCountAsync();

        return Ok(new CleanupPreviewResponse
        {
            RetentionDays = retentionDays,
            CutoffDate = cutoffDate,
            LogsToDelete = count,
            TotalLogs = totalCount,
            LogsToKeep = totalCount - count
        });
    }

    /// <summary>
    /// Delete logs older than specified days (default: 30 days)
    /// </summary>
    [HttpDelete("cleanup")]
    public async Task<ActionResult<CleanupResponse>> CleanupLogs(
        [FromQuery] int retentionDays = DefaultRetentionDays)
    {
        if (retentionDays < 1) retentionDays = DefaultRetentionDays;

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
        var deletedCount = await _logRepository.DeleteLogsOlderThanAsync(cutoffDate);

        _logger.LogInformation("Log cleanup completed: deleted {Count} logs older than {CutoffDate}", 
            deletedCount, cutoffDate);

        return Ok(new CleanupResponse
        {
            DeletedCount = deletedCount,
            RetentionDays = retentionDays,
            CutoffDate = cutoffDate,
            Message = $"Successfully deleted {deletedCount} logs older than {retentionDays} days."
        });
    }
}

public class LogsPagedResponse
{
    public IEnumerable<ApiLog> Logs { get; set; } = new List<ApiLog>();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class CleanupPreviewResponse
{
    public int RetentionDays { get; set; }
    public DateTime CutoffDate { get; set; }
    public int LogsToDelete { get; set; }
    public int TotalLogs { get; set; }
    public int LogsToKeep { get; set; }
}

public class CleanupResponse
{
    public int DeletedCount { get; set; }
    public int RetentionDays { get; set; }
    public DateTime CutoffDate { get; set; }
    public string Message { get; set; } = string.Empty;
}
