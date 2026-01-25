using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;

public class ApiLogRepository : IApiLogRepository
{
    private readonly AppDbContext _context;

    public ApiLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiLog> CreateLogAsync(ApiLog log)
    {
        _context.ApiLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }

    public async Task<IEnumerable<ApiLog>> GetLogsAsync(int page, int pageSize)
    {
        return await _context.ApiLogs
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<ApiLog>> GetErrorLogsAsync(int page, int pageSize)
    {
        return await _context.ApiLogs
            .Where(l => l.StatusCode >= 400 || l.ErrorMessage != null)
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<ApiLog?> GetLogByIdAsync(long id)
    {
        return await _context.ApiLogs.FindAsync(id);
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _context.ApiLogs.CountAsync();
    }

    public async Task<int> GetErrorCountAsync()
    {
        return await _context.ApiLogs
            .Where(l => l.StatusCode >= 400 || l.ErrorMessage != null)
            .CountAsync();
    }

    public async Task<IEnumerable<ApiLog>> GetLogsByDateRangeAsync(DateTime startDate, DateTime endDate, int page, int pageSize)
    {
        return await _context.ApiLogs
            .Where(l => l.Timestamp >= startDate && l.Timestamp <= endDate)
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> DeleteLogsOlderThanAsync(DateTime cutoffDate)
    {
        return await _context.ApiLogs
            .Where(l => l.Timestamp < cutoffDate)
            .ExecuteDeleteAsync();
    }

    public async Task<int> GetLogsCountOlderThanAsync(DateTime cutoffDate)
    {
        return await _context.ApiLogs
            .Where(l => l.Timestamp < cutoffDate)
            .CountAsync();
    }
}
