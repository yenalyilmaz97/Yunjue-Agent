using KeciApp.API.Models;
using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IUserService
{
    // User operations
    Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync();
    Task<UserResponseDTO> GetUserByIdAsync(int userId);
    Task<UserResponseDTO> GetProfileAsync(int userId);
    Task<IEnumerable<UserResponseDTO>> GetUsersByRoleIdAsync(int roleId);
    Task<UserResponseDTO> CreateUserAsync(CreateUserRequest request);
    Task<UserResponseDTO> UpdateUserAsync(EditUserRequest request);
    Task<UserResponseDTO> DeleteUserAsync(int userId);
    Task<UserResponseDTO> AddTimeToUserAsync(int userId, int dayCount);
    Task<UserResponseDTO> ChangePasswordAsync(int userId, string newPassword);
    Task<UserResponseDTO> BanUserAsync(int userId);
    Task<UserResponseDTO> AssignRoleToUserAsync(int userId, int roleId);
    Task<UserResponseDTO> UpdateProfilePictureAsync(int userId, string profilePictureUrl);
    Task<UserResponseDTO> AddKeciTimeToUser(AddKeciTimeDTO dto);
    
}