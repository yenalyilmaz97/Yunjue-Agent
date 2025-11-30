using Microsoft.AspNetCore.Mvc;
using KeciApp.API.Interfaces;
using KeciApp.API.DTOs;
using KeciApp.API.Models;
using KeciApp.API.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // User operations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserResponseDTO>> GetUserById(int userId)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(userId);
            return Ok(user);
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

    [HttpGet("profile/{userId}")]
    public async Task<ActionResult<UserResponseDTO>> GetProfile(int userId)
    {
        try
        {
            var user = await _userService.GetProfileAsync(userId);
            return Ok(user);
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

    [HttpGet("role/{roleId}")]
    public async Task<ActionResult<IEnumerable<UserResponseDTO>>> GetUsersByRoleId(int roleId)
    {
        try
        {
            var users = await _userService.GetUsersByRoleIdAsync(roleId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<UserResponseDTO>> AddUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUserById), new { userId = user.UserId }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut]
    public async Task<ActionResult<UserResponseDTO>> EditUser([FromBody] EditUserRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.UpdateUserAsync(request);
            return Ok(user);
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

    [HttpPut("keci")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<UserResponseDTO>> AddKeciTimeToUser([FromBody] AddKeciTimeDTO dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.AddKeciTimeToUser(dto);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message});
        }
    }

    [HttpDelete("{userId}")]
    public async Task<ActionResult<UserResponseDTO>> DeleteUser(int userId)
    {
        try
        {
            var user = await _userService.DeleteUserAsync(userId);
            return Ok(user);
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

    [HttpPost("add-time")]
    [AuthorizeRoles("admin", "superadmin")]
    public async Task<ActionResult<UserResponseDTO>> AddTimeToUser([FromBody] AddTimeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.AddTimeToUserAsync(request.UserId, request.DayCount);
            return Ok(user);
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

    [HttpPost("change-password")]
    public async Task<ActionResult<UserResponseDTO>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.ChangePasswordAsync(request.UserId, request.NewPassword);
            return Ok(user);
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

    [HttpPost("ban/{userId}")]
    public async Task<ActionResult<UserResponseDTO>> BanUser(int userId)
    {
        try
        {
            var user = await _userService.BanUserAsync(userId);
            return Ok(user);
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

    [HttpPost("assign-role")]
    public async Task<ActionResult<UserResponseDTO>> AssignRoleToUser([FromBody] AssignRoleRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.AssignRoleToUserAsync(request.UserId, request.RoleId);
            return Ok(user);
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

    [HttpPost("{userId}/profile-picture")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UserResponseDTO>> UploadProfilePicture(int userId, [FromForm] UploadProfilePictureRequest request)
    {
        try
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "File is required" });
            }

            // Get user to get username
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Upload profile picture
            var fileUploadService = HttpContext.RequestServices.GetRequiredService<IFileUploadService>();
            string profilePictureUrl = await fileUploadService.UploadProfilePictureAsync(request.File, user.UserName);

            // Update user's profile picture URL
            var updatedUser = await _userService.UpdateProfilePictureAsync(userId, profilePictureUrl);
            return Ok(updatedUser);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while uploading the profile picture", error = ex.Message });
        }
    }

    // Role operations
}

// Request DTO for profile picture upload
public class UploadProfilePictureRequest
{
    public IFormFile File { get; set; }
}
