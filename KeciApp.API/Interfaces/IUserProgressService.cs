using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IUserProgressService
{
    Task<IEnumerable<UserProgressResponseDTO>> GetAllUserProgressByUserIdAsync(int userId);
    Task<UserProgressResponseDTO?> GetUserProgressByUserIdAndWeekIdAsync(int userId, int weekId);
    Task<UserProgressResponseDTO> CreateOrUpdateUserProgressAsync(CreateUserProgressRequest request);
    Task<UserProgressResponseDTO> UpdateUserProgressAsync(UpdateUserProgressRequest request);
    Task<UserProgressResponseDTO> DeleteUserProgressAsync(int userProgressId);
}

