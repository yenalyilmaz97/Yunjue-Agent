using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;
public class AnswersRepository : IAnswersRepository
{
    private readonly AppDbContext _context;

    public AnswersRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Answers>> GetAllAnswersAsync()
    {
        return await _context.Answers
            .Include(a => a.Question)
            .Include(a => a.User)
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync();
    }
    public async Task<Answers?> GetAnswerByQuestionIdAsync(int questionId)
    {
        return await _context.Answers
            .Include(a => a.Question)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.QuestionId == questionId);
    }
    public async Task<Answers?> GetAnswerByIdAsync(int answerId)
    {
        return await _context.Answers
            .Include(a => a.Question)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.AnswerId == answerId);
    }
    public async Task<Answers> AddAnswerAsync(Answers answer)
    {
        answer.CreatedAt = DateTime.UtcNow;
        answer.UpdatedAt = DateTime.UtcNow;

        _context.Answers.Add(answer);

        // Update question status
        var question = await _context.Questions.FindAsync(answer.QuestionId);
        if (question != null)
        {
            question.isAnswered = true;
            question.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return await GetAnswerByIdAsync(answer.AnswerId) ?? answer;
    }
    public async Task<Answers> UpdateAnswerAsync(Answers answer)
    {
        answer.UpdatedAt = DateTime.UtcNow;

        _context.Answers.Update(answer);
        await _context.SaveChangesAsync();

        return await GetAnswerByIdAsync(answer.AnswerId) ?? answer;
    }
    public async Task RemoveAnswerAsync(Answers answer)
    {
        // Update question status
        var question = await _context.Questions.FindAsync(answer.QuestionId);
        if (question != null)
        {
            question.isAnswered = false;
            question.UpdatedAt = DateTime.UtcNow;
        }

        _context.Answers.Remove(answer);
        await _context.SaveChangesAsync();
    }
}
