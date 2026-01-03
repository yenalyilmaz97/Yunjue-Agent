using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;
public class UserSeriesAccessRepository : IUserSeriesAccessRepository
{
    private readonly AppDbContext _context;

    public UserSeriesAccessRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<UserSeriesAccess>> GetAllUserSeriesAccessAsync()
    {
        return await _context.UserSeriesAccesses
            .Include(usa => usa.User)
            .Include(usa => usa.PodcastSeries)
            .Include(usa => usa.Article)
            .ToListAsync();
    }
    public async Task<IEnumerable<UserSeriesAccess>> GetUserSeriesAccessByUserIdAsync(int userId)
    {
        return await _context.UserSeriesAccesses
            .Where(usa => usa.UserId == userId)
            .Include(usa => usa.PodcastSeries)
            .Include(usa => usa.Article)
            .ToListAsync();
    }
    public async Task<UserSeriesAccess?> GetUserSeriesAccessByIdAsync(int id)
    {
        return await _context.UserSeriesAccesses
            .Include(usa => usa.User)
            .Include(usa => usa.PodcastSeries)
            .Include(usa => usa.Article)
            .FirstOrDefaultAsync(usa => usa.UserSeriesAccessId == id);
    }
    public async Task<UserSeriesAccess?> GetUserSeriesAccessAsync(int userId, int? seriesId)
    {
        return await _context.UserSeriesAccesses
            .Include(usa => usa.User)
            .Include(usa => usa.PodcastSeries)
            .Include(usa => usa.Article)
            .FirstOrDefaultAsync(usa => usa.UserId == userId && usa.SeriesId == seriesId);
    }
    public async Task<UserSeriesAccess> CreateUserSeriesAccessAsync(UserSeriesAccess access)
    {
        access.UpdatedAt = DateTime.UtcNow;

        _context.UserSeriesAccesses.Add(access);
        await _context.SaveChangesAsync();

        return await GetUserSeriesAccessAsync(access.UserId, access.SeriesId) ?? access;
    }
    public async Task<UserSeriesAccess> UpdateUserSeriesAccessAsync(UserSeriesAccess access)
    {
        access.UpdatedAt = DateTime.UtcNow;

        _context.UserSeriesAccesses.Update(access);
        await _context.SaveChangesAsync();

        return await GetUserSeriesAccessByIdAsync(access.UserSeriesAccessId) ?? access;
    }
    public async Task DeleteUserSeriesAccessAsync(int accessId)
    {
        var access = await _context.UserSeriesAccesses.FindAsync(accessId);
        if (access != null)
        {
            _context.UserSeriesAccesses.Remove(access);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<UserSeriesAccess>> BulkCreateUserSeriesAccessAsync(IEnumerable<UserSeriesAccess> accesses)
    {
        var accessList = accesses.ToList();
        if (!accessList.Any())
            return Enumerable.Empty<UserSeriesAccess>();

        // Set UpdatedAt for all accesses
        var now = DateTime.UtcNow;
        foreach (var access in accessList)
        {
            access.UpdatedAt = now;
        }

        // Bulk insert all accesses at once
        // Service layer has already filtered out existing accesses,
        // so this should succeed in most cases
        await _context.UserSeriesAccesses.AddRangeAsync(accessList);
        await _context.SaveChangesAsync();

        return accessList;
    }
}
