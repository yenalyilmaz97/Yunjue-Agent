using KeciApp.API.DTOs;

namespace KeciApp.API.Services;

public interface IWeeklyService
{
    // Weekly Content
    Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentAsync();
    Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentByWeekIdAsync(int weekId);
    Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentByUserIdAsync(int userId);
    Task<WeeklyContentResponseDTO> AddWeeklyContentAsync(CreateWeeklyContentRequest request);
    Task<WeeklyContentResponseDTO> EditWeeklyContentAsync(EditWeeklyContentRequest request);
    Task<WeeklyContentResponseDTO> DeleteWeeklyContentAsync(int weeklyContentId);
    Task<bool> GenerateWeeklyContentAsync();
    
    // User Weekly Content
    Task<WeeklyContentResponseDTO> GetUserWeeklyContentAsync(int userId);
    Task<WeeklyContentResponseDTO> AssignWeeklyContentToUserAsync(AssignWeeklyContentRequest request);
    
    // UserWeeklyAssignment
    Task<IEnumerable<WeeklyContentResponseDTO>> GetAvailableWeeksAsync();
}
