using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IApiLogRepository
{
    Task<ApiLog> CreateLogAsync(ApiLog log);
    Task<IEnumerable<ApiLog>> GetLogsAsync(int page, int pageSize);
    Task<IEnumerable<ApiLog>> GetErrorLogsAsync(int page, int pageSize);
    Task<ApiLog?> GetLogByIdAsync(long id);
    Task<int> GetTotalCountAsync();
    Task<int> GetErrorCountAsync();
    Task<IEnumerable<ApiLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate, int page, int pageSize);
    
    // Cleanup methods for log retention
    Task<int> DeleteLogsOlderThanAsync(DateTime cutoffDate);
    Task<int> GetLogsCountOlderThanAsync(DateTime cutoffDate);
}
