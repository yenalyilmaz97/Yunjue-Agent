using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class TasksRepository : ITasksRepository
{
    private readonly AppDbContext _context;

    public TasksRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<WeeklyTask>> GetAllTasksAsync()
    {
        return await _context.Tasks.ToListAsync();
    }
    public async Task<WeeklyTask?> GetTaskByIdAsync(int taskId)
    {
        return await _context.Tasks.FindAsync(taskId);
    }
    public async Task<int> GetMaxTaskOrderAsync()
    {
        return await _context.Tasks.MaxAsync(t => t.order);
    }
    public async Task<int> GetTaskIdByOrderAsync(int order)
    {
        return await _context.Tasks
            .Where(t => t.order == order)
            .Select(t => t.TaskId)
            .FirstOrDefaultAsync();
    }
    public async Task<WeeklyTask> CreateTaskAsync(WeeklyTask task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        return task;
    }
    public async Task<WeeklyTask> UpdateTaskAsync(WeeklyTask task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();
        return task;
    }
    public async Task RemoveTaskAsync(WeeklyTask task)
    {
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }
}
