using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IRoleRepository
{
    Task<Role> GetUsersRoleAsync(int userId);
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task<Role> GetRoleByIdAsync(int roleId);
    Task<Role> CreateRoleAsync(Role role);
    Task<Role> UpdateRoleAsync(Role role);
    Task<Role> DeleteRoleAsync(int roleId);

}
