using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public interface IWeeklyRepository
{
    // Weekly Content
    Task<IEnumerable<WeeklyContent>> GetAllWeeklyContentAsync();
    Task<IEnumerable<WeeklyContent>> GetAllWeeklyContentByWeekIdAsync(int weekId);
    Task<WeeklyContent?> GetWeeklyContentByIdAsync(int weekId);
    Task<WeeklyContent> CreateWeeklyContentAsync(WeeklyContent weeklyContent);
    Task<WeeklyContent> UpdateWeeklyContentAsync(WeeklyContent weeklyContent);
    Task RemoveWeeklyContentAsync(WeeklyContent weeklyContent);
    Task<int> GetMaxWeeklyContentOrderAsync();
    Task<int> GetMaxPotentialOrderAsync();
}
