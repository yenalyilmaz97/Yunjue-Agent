using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IDailyContentService
{
    Task<IEnumerable<DailyContentResponseDTO>> GetAllDailyContentAsync();
    Task<DailyContentResponseDTO?> GetDailyContentByIdAsync(int dailyContentId);
    Task<DailyContentResponseDTO?> GetDailyContentByDayOrderAsync(int dayOrder);
    Task<DailyContentResponseDTO?> GetUsersDailyContentOrderAsync(int userId);
    Task<DailyContentResponseDTO> CreateDailyContentAsync(CreateDailyContentRequest request);
    Task<DailyContentResponseDTO> UpdateDailyContentAsync(UpdateDailyContentRequest request);
    Task<DailyContentResponseDTO> DeleteDailyContentAsync(int dailyContentId);
    Task<BulkUpdateDailyContentResponseDTO> IncrementDailyContentForAllUsersAsync();
    Task<IEnumerable<DailyContentResponseDTO>> GetUsersDailyContentHistoryAsync(int userId);
}

