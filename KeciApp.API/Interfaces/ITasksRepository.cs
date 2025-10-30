using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface ITasksRepository
{
    Task<IEnumerable<WeeklyTask>> GetAllTasksAsync();
    Task<WeeklyTask?> GetTaskByIdAsync(int taskId);
    Task<WeeklyTask> CreateTaskAsync(WeeklyTask task);
    Task<WeeklyTask> UpdateTaskAsync(WeeklyTask task);
    Task RemoveTaskAsync(WeeklyTask task);
    Task<int> GetMaxTaskOrderAsync();
    Task<int> GetTaskIdByOrderAsync(int order);

}
