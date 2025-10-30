using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    private readonly IRoleRepository _roleRepository;
    public UserRepository(AppDbContext context, IRoleRepository roleRepository) : base(context)
    {
        _roleRepository = roleRepository;
    }

    // User operations
    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .OrderBy(u => u.UserName)
            .ToListAsync();
    }

    public async Task<User> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    public async Task<User> GetUserByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> GetUserByUsernameAsync(string username)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserName == username);
    }

    public async Task<IEnumerable<User>> GetUsersByRoleIdAsync(int roleId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .Where(u => u.RoleId == roleId)
            .OrderBy(u => u.UserName)
            .ToListAsync();
    }

    public async Task<User> CreateUserAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        
        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        user.UpdatedAt = DateTime.UtcNow;
        
        var entry = _context.Entry(user);
        entry.State = EntityState.Modified;
        await _context.SaveChangesAsync();
        
        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<User> DeleteUserAsync(int userId)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        
        return user;
    }

    public async Task<User> AddTimeToUserAsync(int userId, int dayCount)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        user.SubscriptionEnd = user.SubscriptionEnd.AddDays(dayCount);
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        
        return user;
    }

    public async Task<User> ChangePasswordAsync(int userId, string newPasswordHash)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        user.PasswordHash = newPasswordHash;
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        
        return user;
    }

    public async Task<User> BanUserAsync(int userId)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        // For now, we'll set subscription end to past date to effectively ban the user
        user.SubscriptionEnd = DateTime.UtcNow.AddDays(-1);
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        
        return user;
    }

    public async Task<User> AssignRoleToUserAsync(int userId, int roleId)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        var role = await _roleRepository.GetRoleByIdAsync(roleId);
        if (role == null)
            throw new InvalidOperationException($"Role with ID {roleId} not found");

        user.RoleId = roleId;
        user.UpdatedAt = DateTime.UtcNow;
        
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        
        return await GetUserByIdAsync(userId);
    }

    public async Task<User> AddKeciTimeToUser(int userId, DateTime time)
    {
        var user = await GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        user.KeciTimeEnd = time;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return await GetUserByIdAsync(userId);
    }

    // Helper methods
    public async Task<bool> UserExistsAsync(int userId)
    {
        return await _context.Users.AnyAsync(u => u.UserId == userId);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.UserName == username);
    }

    public async Task<bool> RoleExistsAsync(int roleId)
    {
        return await _context.Roles.AnyAsync(r => r.RoleId == roleId);
    }
}
