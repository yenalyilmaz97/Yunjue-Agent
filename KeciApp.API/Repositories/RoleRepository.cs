using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _context;
    private readonly IUserRepository _userRepository;

    public RoleRepository(AppDbContext context, IUserRepository userRepository)
    {
        _context = context;
        _userRepository = userRepository;
    }

    public async Task<Role> GetUsersRoleAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        return user.Role;
    }

    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
        return await _context.Roles
            .OrderBy(r => r.RoleName)
            .ToListAsync();
    }

    public async Task<Role> GetRoleByIdAsync(int roleId)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == roleId);
    }

    public async Task<Role> CreateRoleAsync(Role role)
    {
        await _context.Roles.AddAsync(role);
        await _context.SaveChangesAsync();

        return role;
    }

    public async Task<Role> UpdateRoleAsync(Role role)
    {
        var entry = _context.Entry(role);
        entry.State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return role;
    }

    public async Task<Role> DeleteRoleAsync(int roleId)
    {
        var role = await GetRoleByIdAsync(roleId);
        if (role == null)
            throw new InvalidOperationException($"Role with ID {roleId} not found");

        // Check if any users are using this role
        var usersWithRole = await _context.Users
            .Where(u => u.RoleId == roleId)
            .CountAsync();

        if (usersWithRole > 0)
            throw new InvalidOperationException($"Cannot delete role. {usersWithRole} users are using this role.");

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();

        return role;
    }
}
