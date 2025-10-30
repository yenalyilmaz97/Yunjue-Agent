using KeciApp.API.Models;
using KeciApp.API.Interfaces;
using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IUserRepository : IGenericRepository<User>
{
    // User operations
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User> GetUserByIdAsync(int userId);
    Task<User> GetUserByEmailAsync(string email);
    Task<User> GetUserByUsernameAsync(string username);
    Task<IEnumerable<User>> GetUsersByRoleIdAsync(int roleId);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task<User> DeleteUserAsync(int userId);
    Task<User> AddTimeToUserAsync(int userId, int dayCount);
    Task<User> ChangePasswordAsync(int userId, string newPasswordHash);
    Task<User> BanUserAsync(int userId);
    Task<User> AssignRoleToUserAsync(int userId, int roleId);
    Task<User> AddKeciTimeToUser(int userId, DateTime time);
    
    
    // Additional helper methods
    Task<bool> UserExistsAsync(int userId);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> RoleExistsAsync(int roleId);
}