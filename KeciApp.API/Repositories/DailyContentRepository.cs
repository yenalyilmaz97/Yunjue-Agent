using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class DailyContentRepository : IDailyContentRepository
{
    private readonly AppDbContext _context;

    public DailyContentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DailyContent>> GetAllDailyContentAsync()
    {
        return await _context.DailyContents
            .Include(dc => dc.Affirmations)
            .Include(dc => dc.Aphorisms)
            .OrderBy(dc => dc.DayOrder)
            .ToListAsync();
    }

    public async Task<DailyContent?> GetDailyContentByIdAsync(int dailyContentId)
    {
        return await _context.DailyContents
            .Include(dc => dc.Affirmations)
            .Include(dc => dc.Aphorisms)
            .FirstOrDefaultAsync(dc => dc.DailyContentId == dailyContentId);
    }

    public async Task<DailyContent?> GetDailyContentByDayOrderAsync(int dayOrder)
    {
        return await _context.DailyContents
            .Include(dc => dc.Affirmations)
            .Include(dc => dc.Aphorisms)
            .FirstOrDefaultAsync(dc => dc.DayOrder == dayOrder);
    }

    public async Task<int> GetMaxDayOrderAsync()
    {
        var hasAny = await _context.DailyContents.AnyAsync();
        if (!hasAny) return 0;
        return await _context.DailyContents.MaxAsync(dc => dc.DayOrder);
    }

    public async Task<DailyContent> CreateDailyContentAsync(DailyContent dailyContent)
    {
        _context.DailyContents.Add(dailyContent);
        await _context.SaveChangesAsync();
        return await GetDailyContentByIdAsync(dailyContent.DailyContentId) ?? dailyContent;
    }

    public async Task<DailyContent> UpdateDailyContentAsync(DailyContent dailyContent)
    {
        _context.DailyContents.Update(dailyContent);
        await _context.SaveChangesAsync();
        return await GetDailyContentByIdAsync(dailyContent.DailyContentId) ?? dailyContent;
    }

    public async Task RemoveDailyContentAsync(DailyContent dailyContent)
    {
        _context.DailyContents.Remove(dailyContent);
        await _context.SaveChangesAsync();
    }
}

