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
            .ToListAsync();
    }
    public async Task<IEnumerable<UserSeriesAccess>> GetUserSeriesAccessByUserIdAsync(int userId)
    {
        return await _context.UserSeriesAccesses
            .Where(usa => usa.UserId == userId)
            .Include(usa => usa.PodcastSeries)
            .ToListAsync();
    }
    public async Task<UserSeriesAccess?> GetUserSeriesAccessByIdAsync(int id)
    {
        return await _context.UserSeriesAccesses
            .Include(usa => usa.User)
            .Include(usa => usa.PodcastSeries)
            .FirstOrDefaultAsync(usa => usa.UserSeriesAccessId == id);
    }
    public async Task<UserSeriesAccess?> GetUserSeriesAccessAsync(int userId, int? seriesId)
    {
        return await _context.UserSeriesAccesses
            .Include(usa => usa.User)
            .Include(usa => usa.PodcastSeries)
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
}
