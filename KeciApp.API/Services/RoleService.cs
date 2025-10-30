using System.Runtime.CompilerServices;
using AutoMapper;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using System.Security.Cryptography;
using System.Text;
using KeciApp.API.Repositories;

namespace KeciApp.API.Services;
public class RoleService : IRoleService
{
    private readonly IRoleRepository _roleRepository;
    private readonly IMapper _mapper;

    public RoleService(IMapper mapper, IRoleRepository roleRepository)
    {
        _roleRepository = roleRepository;
        _mapper = mapper;
    }

    public async Task<RoleResponseDTO> GetUsersRoleAsync(int userId)
    {
        var role = await _roleRepository.GetUsersRoleAsync(userId);
        return _mapper.Map<RoleResponseDTO>(role);
    }

    public async Task<IEnumerable<RoleResponseDTO>> GetAllRolesAsync()
    {
        var roles = await _roleRepository.GetAllRolesAsync();
        return _mapper.Map<IEnumerable<RoleResponseDTO>>(roles);
    }

    public async Task<RoleResponseDTO> GetRoleByIdAsync(int roleId)
    {
        var role = await _roleRepository.GetRoleByIdAsync(roleId);
        if (role == null)
            throw new InvalidOperationException($"Role with ID {roleId} not found");

        return _mapper.Map<RoleResponseDTO>(role);
    }

    public async Task<RoleResponseDTO> CreateRoleAsync(CreateRoleRequest request)
    {
        var role = _mapper.Map<Role>(request);
        var createdRole = await _roleRepository.CreateRoleAsync(role);
        return _mapper.Map<RoleResponseDTO>(createdRole);
    }

    public async Task<RoleResponseDTO> UpdateRoleAsync(EditRoleRequest request)
    {
        var existingRole = await _roleRepository.GetRoleByIdAsync(request.RoleId);
        if (existingRole == null)
            throw new InvalidOperationException($"Role with ID {request.RoleId} not found");

        // Update existing role entity properties
        existingRole.RoleName = request.RoleName;

        // Update role
        var updatedRole = await _roleRepository.UpdateRoleAsync(existingRole);
        return _mapper.Map<RoleResponseDTO>(updatedRole);
    }

    public async Task<RoleResponseDTO> DeleteRoleAsync(int roleId)
    {
        var deletedRole = await _roleRepository.DeleteRoleAsync(roleId);
        return _mapper.Map<RoleResponseDTO>(deletedRole);
    }
}
