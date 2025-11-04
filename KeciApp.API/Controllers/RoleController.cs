using Microsoft.AspNetCore.Mvc;
using KeciApp.API.Interfaces;
using KeciApp.API.DTOs;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
    {
        _roleService = roleService;
    }
    
    [HttpGet("user-role/{userId}")]
    public async Task<ActionResult<RoleResponseDTO>> GetUsersRole(int userId)
    {
        try
        {
            var role = await _roleService.GetUsersRoleAsync(userId);
            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("roles")]
    public async Task<ActionResult<IEnumerable<RoleResponseDTO>>> GetAllRoles()
    {
        try
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("roles/{roleId}")]
    public async Task<ActionResult<RoleResponseDTO>> GetRoleById(int roleId)
    {
        try
        {
            var role = await _roleService.GetRoleByIdAsync(roleId);
            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("roles")]
    public async Task<ActionResult<RoleResponseDTO>> AddRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = await _roleService.CreateRoleAsync(request);
            return CreatedAtAction(nameof(GetRoleById), new { roleId = role.RoleId }, role);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("roles")]
    public async Task<ActionResult<RoleResponseDTO>> EditRole([FromBody] EditRoleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var role = await _roleService.UpdateRoleAsync(request);
            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("roles/{roleId}")]
    public async Task<ActionResult<RoleResponseDTO>> DeleteRole(int roleId)
    {
        try
        {
            var role = await _roleService.DeleteRoleAsync(roleId);
            return Ok(role);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
