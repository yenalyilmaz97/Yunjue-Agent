using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IDailyContentRepository
{
    Task<IEnumerable<DailyContent>> GetAllDailyContentAsync();
    Task<DailyContent?> GetDailyContentByIdAsync(int dailyContentId);
    Task<DailyContent?> GetDailyContentByDayOrderAsync(int dayOrder);
    Task<int> GetMaxDayOrderAsync();
    Task<DailyContent> CreateDailyContentAsync(DailyContent dailyContent);
    Task<DailyContent> UpdateDailyContentAsync(DailyContent dailyContent);
    Task RemoveDailyContentAsync(DailyContent dailyContent);
}

