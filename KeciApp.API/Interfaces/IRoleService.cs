using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IRoleService
{
    Task<RoleResponseDTO> GetUsersRoleAsync(int userId);
    Task<IEnumerable<RoleResponseDTO>> GetAllRolesAsync();
    Task<RoleResponseDTO> GetRoleByIdAsync(int roleId);
    Task<RoleResponseDTO> CreateRoleAsync(CreateRoleRequest request);
    Task<RoleResponseDTO> UpdateRoleAsync(EditRoleRequest request);
    Task<RoleResponseDTO> DeleteRoleAsync(int roleId);

}
