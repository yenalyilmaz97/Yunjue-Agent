using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class UserProgressRepository : IUserProgressRepository
{
    private readonly AppDbContext _context;

    public UserProgressRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserProgress>> GetAllUserProgressByUserIdAsync(int userId)
    {
        return await _context.UserProgresses
            .Where(up => up.UserId == userId)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Music)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Movie)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Task)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.WeeklyQuestion)
            .Include(up => up.Article)
            .Include(up => up.PodcastEpisodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .OrderByDescending(up => up.CompleteTime)
            .ToListAsync();
    }

    public async Task<UserProgress?> GetUserProgressByUserIdAndWeekIdAsync(int userId, int weekId)
    {
        return await _context.UserProgresses
            .Where(up => up.UserId == userId && up.WeekId == weekId)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Music)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Movie)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Task)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.WeeklyQuestion)
            .FirstOrDefaultAsync();
    }

    public async Task<UserProgress?> GetUserProgressByUserIdAndArticleIdAsync(int userId, int articleId)
    {
        return await _context.UserProgresses
            .Where(up => up.UserId == userId && up.ArticleId == articleId)
            .Include(up => up.Article)
            .FirstOrDefaultAsync();
    }

    public async Task<UserProgress?> GetUserProgressByUserIdAndEpisodeIdAsync(int userId, int episodeId)
    {
        return await _context.UserProgresses
            .Where(up => up.UserId == userId && up.EpisodeId == episodeId)
            .Include(up => up.PodcastEpisodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .FirstOrDefaultAsync();
    }

    public async Task<UserProgress?> GetUserProgressByIdAsync(int userProgressId)
    {
        return await _context.UserProgresses
            .Where(up => up.UserProgressId == userProgressId)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Music)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Movie)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.Task)
            .Include(up => up.WeeklyContent)
                .ThenInclude(wc => wc.WeeklyQuestion)
            .Include(up => up.Article)
            .Include(up => up.PodcastEpisodes)
                .ThenInclude(ep => ep.PodcastSeries)
            .FirstOrDefaultAsync();
    }

    public async Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress)
    {
        userProgress.CompleteTime = DateTime.UtcNow;
        _context.UserProgresses.Add(userProgress);
        await _context.SaveChangesAsync();
        
        return await GetUserProgressByIdAsync(userProgress.UserProgressId) ?? userProgress;
    }

    public async Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress)
    {
        if (userProgress.isCompleted)
        {
            userProgress.CompleteTime = DateTime.UtcNow;
        }
        
        _context.UserProgresses.Update(userProgress);
        await _context.SaveChangesAsync();
        
        return await GetUserProgressByIdAsync(userProgress.UserProgressId) ?? userProgress;
    }

    public async Task RemoveUserProgressAsync(UserProgress userProgress)
    {
        _context.UserProgresses.Remove(userProgress);
        await _context.SaveChangesAsync();
    }
}

