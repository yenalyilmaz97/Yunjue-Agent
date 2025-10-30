using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;
public class QuestionRepository : IQuestionRepository
{
    private readonly AppDbContext _context;

    public QuestionRepository(AppDbContext context)
    {
        _context = context;
    }
     public async Task<IEnumerable<Questions>> GetAllQuestionsAsync()
    {
        return await _context.Questions
            .Include(q => q.Episodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(q => q.User)
            .Include(q => q.Answers)
            .OrderByDescending(q => q.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Questions>> GetAllQuestionsByUserIdAsync(int userId)
    {
        return await _context.Questions
            .Where(q => q.UserId == userId)
            .Include(q => q.Episodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(q => q.User)
            .Include(q => q.Answers)
            .OrderByDescending(q => q.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Questions>> GetQuestionsByEpisodeIdAsync(int episodeId)
    {
        return await _context.Questions
            .Where(q => q.EpisodeId == episodeId)
            .Include(q => q.Episodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(q => q.User)
            .Include(q => q.Answers)
            .OrderByDescending(q => q.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Questions?> GetQuestionByIdAsync(int questionId)
    {
        return await _context.Questions
            .Include(q => q.Episodes)
            .Include(q => q.User)
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.QuestionId == questionId);
    }

    public async Task<Questions?> GetQuestionAsync(int userId, int episodeId)
    {
        return await _context.Questions
            .Include(q => q.Episodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(q => q.User)
            .Include(q => q.Answers)
            .FirstOrDefaultAsync(q => q.UserId == userId && q.EpisodeId == episodeId);
    }

    public async Task<Questions> AddQuestionAsync(Questions question)
    {
        question.isAnswered = false;
        question.CreatedAt = DateTime.UtcNow;
        question.UpdatedAt = DateTime.UtcNow;
        
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        
        return await GetQuestionByIdAsync(question.QuestionId) ?? question;
    }

    public async Task<Questions> UpdateQuestionAsync(Questions question)
    {
        question.UpdatedAt = DateTime.UtcNow;
        
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();
        
        return await GetQuestionByIdAsync(question.QuestionId) ?? question;
    }
}
