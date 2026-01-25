using Serilog;

namespace KeciApp.API.Jobs;

/// <summary>
/// Test job to verify Hangfire is working correctly.
/// This job simply logs a message - no database operations.
/// </summary>
public class TestLogJob
{
    /// <summary>
    /// Logs a simple test message. Called by Hangfire scheduler.
    /// </summary>
    public void Execute()
    {
        Log.Information("========================================");
        Log.Information("🐐 HANGFIRE TEST JOB EXECUTED!");
        Log.Information("Current Time (UTC): {Time}", DateTime.UtcNow);
        Log.Information("Current Time (Local): {Time}", DateTime.Now);
        Log.Information("========================================");
    }
}
