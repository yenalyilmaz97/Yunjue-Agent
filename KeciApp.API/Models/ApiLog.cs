using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

/// <summary>
/// Stores API request/response logs and error information.
/// Using long for Id to prevent integer overflow on high-traffic systems.
/// </summary>
public class ApiLog
{
    [Key]
    public long Id { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [StringLength(10)]
    public string HttpMethod { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Path { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? QueryString { get; set; }

    [Required]
    public int StatusCode { get; set; }

    public long DurationMs { get; set; }

    [StringLength(50)]
    public string? UserId { get; set; }

    [StringLength(50)]
    public string? IpAddress { get; set; }

    [StringLength(500)]
    public string? UserAgent { get; set; }

    // Request body - truncated to prevent huge storage
    public string? RequestBody { get; set; }

    // Error information
    [StringLength(2000)]
    public string? ErrorMessage { get; set; }

    public string? StackTrace { get; set; }

    // Exception type for filtering
    [StringLength(200)]
    public string? ExceptionType { get; set; }
}
