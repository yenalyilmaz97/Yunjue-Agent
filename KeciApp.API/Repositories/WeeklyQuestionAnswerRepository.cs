using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class WeeklyQuestionAnswerRepository : IWeeklyQuestionAnswerRepository
{
    private readonly AppDbContext _context;

    public WeeklyQuestionAnswerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WeeklyQuestionAnswer>> GetAllWeeklyQuestionAnswersAsync()
    {
        return await _context.WeeklyQuestionAnswers
            .Include(wqa => wqa.User)
            .Include(wqa => wqa.WeeklyQuestion)
            .ToListAsync();
    }

    public async Task<WeeklyQuestionAnswer?> GetWeeklyQuestionAnswerByIdAsync(int weeklyQuestionAnswerId)
    {
        return await _context.WeeklyQuestionAnswers
            .Include(wqa => wqa.User)
            .Include(wqa => wqa.WeeklyQuestion)
            .FirstOrDefaultAsync(wqa => wqa.WeeklyQuestionAnswerId == weeklyQuestionAnswerId);
    }

    public async Task<WeeklyQuestionAnswer?> GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(int userId, int weeklyQuestionId)
    {
        return await _context.WeeklyQuestionAnswers
            .Include(wqa => wqa.User)
            .Include(wqa => wqa.WeeklyQuestion)
            .FirstOrDefaultAsync(wqa => wqa.UserId == userId && wqa.WeeklyQuestionId == weeklyQuestionId);
    }

    public async Task<IEnumerable<WeeklyQuestionAnswer>> GetWeeklyQuestionAnswersByUserIdAsync(int userId)
    {
        return await _context.WeeklyQuestionAnswers
            .Where(wqa => wqa.UserId == userId)
            .Include(wqa => wqa.User)
            .Include(wqa => wqa.WeeklyQuestion)
            .ToListAsync();
    }

    public async Task<IEnumerable<WeeklyQuestionAnswer>> GetWeeklyQuestionAnswersByQuestionIdAsync(int weeklyQuestionId)
    {
        return await _context.WeeklyQuestionAnswers
            .Where(wqa => wqa.WeeklyQuestionId == weeklyQuestionId)
            .Include(wqa => wqa.User)
            .Include(wqa => wqa.WeeklyQuestion)
            .ToListAsync();
    }

    public async Task<WeeklyQuestionAnswer> CreateWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer)
    {
        _context.WeeklyQuestionAnswers.Add(weeklyQuestionAnswer);
        await _context.SaveChangesAsync();
        return await GetWeeklyQuestionAnswerByIdAsync(weeklyQuestionAnswer.WeeklyQuestionAnswerId) ?? weeklyQuestionAnswer;
    }

    public async Task<WeeklyQuestionAnswer> UpdateWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer)
    {
        _context.WeeklyQuestionAnswers.Update(weeklyQuestionAnswer);
        await _context.SaveChangesAsync();
        return await GetWeeklyQuestionAnswerByIdAsync(weeklyQuestionAnswer.WeeklyQuestionAnswerId) ?? weeklyQuestionAnswer;
    }

    public async Task RemoveWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer)
    {
        _context.WeeklyQuestionAnswers.Remove(weeklyQuestionAnswer);
        await _context.SaveChangesAsync();
    }
}

