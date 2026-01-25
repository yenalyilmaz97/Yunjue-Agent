using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using KeciApp.API.Data;
using KeciApp.API.Models;

namespace KeciApp.API.Middleware;

/// <summary>
/// Middleware that logs all HTTP requests and responses to the database.
/// Captures timing, user info, and error details.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    // Paths to exclude from body logging (sensitive data)
    private static readonly string[] SensitivePaths = { "/api/auth/login", "/api/auth/register", "/api/auth/refresh" };
    
    // Max request body size to log (prevent huge payloads)
    private const int MaxBodyLogSize = 4000;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip logging for static files and hangfire
        if (context.Request.Path.StartsWithSegments("/hangfire") ||
            context.Request.Path.StartsWithSegments("/swagger") ||
            context.Request.Path.Value?.Contains(".") == true)
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();
        var log = new ApiLog
        {
            Timestamp = DateTime.UtcNow,
            HttpMethod = context.Request.Method,
            Path = context.Request.Path.Value ?? "",
            QueryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null,
            IpAddress = GetClientIpAddress(context),
            UserAgent = context.Request.Headers.UserAgent.ToString().Length > 500 
                ? context.Request.Headers.UserAgent.ToString().Substring(0, 500) 
                : context.Request.Headers.UserAgent.ToString()
        };

        // Try to get user ID from JWT token
        try
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            log.UserId = userId;
        }
        catch { /* Ignore - user might not be authenticated */ }

        // Capture request body for non-sensitive endpoints
        if (ShouldLogBody(context.Request))
        {
            log.RequestBody = await GetRequestBodyAsync(context.Request);
        }

        // Capture the original response body stream
        var originalBodyStream = context.Response.Body;
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await _next(context);
            
            log.StatusCode = context.Response.StatusCode;
        }
        catch (Exception ex)
        {
            log.StatusCode = 500;
            log.ErrorMessage = ex.Message.Length > 2000 ? ex.Message.Substring(0, 2000) : ex.Message;
            log.StackTrace = ex.StackTrace;
            log.ExceptionType = ex.GetType().Name;
            
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", log.HttpMethod, log.Path);
            
            // Re-throw to let the exception handler deal with it
            throw;
        }
        finally
        {
            stopwatch.Stop();
            log.DurationMs = stopwatch.ElapsedMilliseconds;

            // Copy the response body back to the original stream
            responseBody.Seek(0, SeekOrigin.Begin);
            await responseBody.CopyToAsync(originalBodyStream);

            // Save log to database asynchronously (fire and forget to not slow down response)
            _ = SaveLogAsync(context.RequestServices, log);
        }
    }

    private bool ShouldLogBody(HttpRequest request)
    {
        if (request.Method == "GET" || request.Method == "DELETE")
            return false;

        var path = request.Path.Value?.ToLowerInvariant() ?? "";
        return !SensitivePaths.Any(p => path.Contains(p.ToLowerInvariant()));
    }

    private async Task<string?> GetRequestBodyAsync(HttpRequest request)
    {
        if (!request.Body.CanSeek)
        {
            request.EnableBuffering();
        }

        request.Body.Position = 0;
        
        using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;

        if (string.IsNullOrEmpty(body))
            return null;

        // Truncate if too large
        return body.Length > MaxBodyLogSize ? body.Substring(0, MaxBodyLogSize) + "..." : body;
    }

    private string? GetClientIpAddress(HttpContext context)
    {
        // Check for forwarded IP (when behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').First().Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString();
    }

    private async Task SaveLogAsync(IServiceProvider services, ApiLog log)
    {
        try
        {
            using var scope = services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            dbContext.ApiLogs.Add(log);
            await dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save API log to database");
        }
    }
}

// Extension method for easy middleware registration
public static class RequestLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RequestLoggingMiddleware>();
    }
}
