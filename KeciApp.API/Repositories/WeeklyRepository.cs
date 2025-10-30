using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class WeeklyRepository : IWeeklyRepository
{
    private readonly AppDbContext _context;
    private readonly IMusicRepository _musicRepository;
    private readonly IMoviesRepository _moviesRepository;
    private readonly ITasksRepository _tasksRepository;
    private readonly IWeeklyQuestionRepository _weeklyQuestionRepository;

    public WeeklyRepository(AppDbContext context, IMoviesRepository moviesRepository, IMusicRepository musicRepository, ITasksRepository tasksRepository, IWeeklyQuestionRepository weeklyQuuetionRepository)
    {
        _context = context;
        _moviesRepository = moviesRepository;
        _musicRepository = musicRepository;
        _tasksRepository = tasksRepository;
        _weeklyQuestionRepository = weeklyQuuetionRepository;
    }

    // Weekly Content
    public async Task<IEnumerable<WeeklyContent>> GetAllWeeklyContentAsync()
    {
        return await _context.WeeklyContents
            .Include(wc => wc.Music)
            .Include(wc => wc.Movie)
            .Include(wc => wc.Task)
            .Include(wc => wc.WeeklyQuestion)
            .OrderBy(wc => wc.WeekOrder)
            .ToListAsync();
    }

    public async Task<IEnumerable<WeeklyContent>> GetAllWeeklyContentByWeekIdAsync(int weekId)
    {
        return await _context.WeeklyContents
            .Where(wc => wc.WeekId == weekId)
            .Include(wc => wc.Music)
            .Include(wc => wc.Movie)
            .Include(wc => wc.Task)
            .Include(wc => wc.WeeklyQuestion)
            .ToListAsync();
    }

    public async Task<WeeklyContent?> GetWeeklyContentByIdAsync(int weekId)
    {
        return await _context.WeeklyContents
            .Include(wc => wc.Music)
            .Include(wc => wc.Movie)
            .Include(wc => wc.Task)
            .Include(wc => wc.WeeklyQuestion)
            .FirstOrDefaultAsync(wc => wc.WeekId == weekId);
    }

    public async Task<int> GetMaxWeeklyContentOrderAsync()
    {
        return await _context.WeeklyContents.MaxAsync(wc => wc.WeekOrder);
    }

    public async Task<int> GetMaxPotentialOrderAsync()
    {
        // Execute sequentially to avoid concurrent operations on the same DbContext
        var maxMusic = await _musicRepository.GetMaxMusicOrderAsync();
        var maxMovie = await _moviesRepository.GetMaxMovieOrderAsync();
        var maxTask = await _tasksRepository.GetMaxTaskOrderAsync();
        var maxQuestion = await _weeklyQuestionRepository.GetMaxWeeklyQuestionOrderAsync();

        var min = Math.Min(Math.Min(maxMusic, maxMovie), Math.Min(maxTask, maxQuestion));
        return min;
    }

    public async Task<WeeklyContent> CreateWeeklyContentAsync(WeeklyContent weeklyContent)
    {
        _context.WeeklyContents.Add(weeklyContent);
        await _context.SaveChangesAsync();
        
        return await GetWeeklyContentByIdAsync(weeklyContent.WeekId) ?? weeklyContent;
    }

    public async Task<WeeklyContent> UpdateWeeklyContentAsync(WeeklyContent weeklyContent)
    {
        _context.WeeklyContents.Update(weeklyContent);
        await _context.SaveChangesAsync();
        
        return await GetWeeklyContentByIdAsync(weeklyContent.WeekId) ?? weeklyContent;
    }

    public async Task RemoveWeeklyContentAsync(WeeklyContent weeklyContent)
    {
        _context.WeeklyContents.Remove(weeklyContent);
        await _context.SaveChangesAsync();
    }
}
