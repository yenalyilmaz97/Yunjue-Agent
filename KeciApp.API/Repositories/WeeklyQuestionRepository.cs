using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class WeeklyQuestionRepository : IWeeklyQuestionRepository
{
    private readonly AppDbContext _context;

    public WeeklyQuestionRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<WeeklyQuestion>> GetAllWeeklyQuestionsAsync()
    {
        return await _context.WeeklyQuestions.ToListAsync();
    }
    public async Task<WeeklyQuestion?> GetWeeklyQuestionByIdAsync(int weeklyQuestionId)
    {
        return await _context.WeeklyQuestions.FindAsync(weeklyQuestionId);
    }
    public async Task<int> GetMaxWeeklyQuestionOrderAsync()
    {
        return await _context.WeeklyQuestions.MaxAsync(wq => wq.order);
    }
    public async Task<int> GetWeeklyQuestionIdByOrderAsync(int order)
    {
        return await _context.WeeklyQuestions
            .Where(wq => wq.order == order)
            .Select(wq => wq.WeeklyQuestionId)
            .FirstOrDefaultAsync();
    }
    public async Task<WeeklyQuestion> CreateWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion)
    {
        _context.WeeklyQuestions.Add(weeklyQuestion);
        await _context.SaveChangesAsync();
        return weeklyQuestion;
    }
    public async Task<WeeklyQuestion> UpdateWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion)
    {
        _context.WeeklyQuestions.Update(weeklyQuestion);
        await _context.SaveChangesAsync();
        return weeklyQuestion;
    }
    public async Task RemoveWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion)
    {
        _context.WeeklyQuestions.Remove(weeklyQuestion);
        await _context.SaveChangesAsync();
    }
}
