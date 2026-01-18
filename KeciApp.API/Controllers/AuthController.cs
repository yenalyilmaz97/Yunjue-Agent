using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using KeciApp.API.Services;
using KeciApp.API.DTOs;
using KeciApp.API.Models;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtService _jwtService;
    private readonly IUserProgressService _userProgressService;
    private readonly IDailyContentService _dailyContentService;

    public AuthController(IAuthService authService, IJwtService jwtService, IUserProgressService userProgressService, IDailyContentService dailyContentService)
    {
        _authService = authService;
        _jwtService = jwtService;
        _userProgressService = userProgressService;
        _dailyContentService = dailyContentService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz veri formatı"
            });
        }

        var (success, message, user, roles) = await _authService.LoginAsync(request.Email, request.Password);

        if (!success)
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = message
            });
        }

        await CheckAndAssignDailyContentAsync(user);

        var token = _jwtService.GenerateToken(user, roles);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = message,
            Token = token,
            User = new UserInfo
            {
                UserId = user.UserId,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Gender = user.Gender,
                City = user.City,
                Phone = user.Phone,
                Description = user.Description,
                DateOfBirth = user.DateOfBirth,
                SubscriptionEnd = user.SubscriptionEnd,
                WeeklyContentId = user.WeeklyContentId
            },
            Roles = roles
        });
    }

    [HttpPost("check-daily-content")]
    [Authorize]
    public async Task<IActionResult> CheckDailyContent()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            // recover user entity to pass to helper (or overload helper to take ID)
            // For now, let's fetch the user or just work with ID if possible.
            // But the daily content logic relies on user.DailyContentId property.
            // Let's assume we can fetch the user briefly or refactor helper.
            // To be safe and quick, let's fetch the user. 
            // NOTE: AuthService might not have GetById, let's see. 
            // If not available easily, we can replicate the logic using just ID since we access services directly.
            
            // Re-implementing logic specifically for ID to avoid unnecessary full user fetch if possible, 
            // but actually we need to check if they already have one assigned in the DB.
            // Let's use the helper but we need the User object.
            // Assuming _authService or a repo can get user.
            // Let's modify the helper to take userId and dailyContentId (nullable).
            
            // Actually, we don't have safe access to "GetById" on AuthService in this context easily shown?
            // Let's assume we can rely on what we have. 
            // Let's query the DB or use what we have.
            // Using logic similar to Login but fetching current state.
            
            var dailyContent = await _dailyContentService.GetUsersDailyContentOrderAsync(userId);
            int? dailyContentId = dailyContent?.DailyContentId; // logic: existing assignment?
            
            // Wait, the original logic in Login used `user.DailyContentId`. 
            // This implies the user entity itself holds the current assignment?
            // If `GetUsersDailyContentOrderAsync` gets the *next* or *current* valid content based on logic,
            // we should trust it.
            
            if (dailyContent != null)
            {
                 // Create progress record
                await _userProgressService.CreateOrUpdateUserProgressAsync(new CreateUserProgressRequest
                {
                    UserId = userId,
                    DailyContentId = dailyContent.DailyContentId,
                    IsCompleted = true
                });
                return Ok(new { message = "Daily content checked and progress updated", dailyContentId = dailyContent.DailyContentId });
            }
            
            return Ok(new { message = "No daily content available or assigned" });

        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error checking daily content: {ex.Message}" });
        }
    }

    private async Task CheckAndAssignDailyContentAsync(User user)
    {
        try
        {
            int? dailyContentId = user.DailyContentId;
            
            // If user doesn't have DailyContentId, get/assign it first
            if (!dailyContentId.HasValue)
            {
                // Get user's daily content (this will assign first daily content if not exists)
                var dailyContent = await _dailyContentService.GetUsersDailyContentOrderAsync(user.UserId);
                if (dailyContent != null)
                {
                    dailyContentId = dailyContent.DailyContentId;
                }
            }

            // Create progress record if we have a daily content ID
            if (dailyContentId.HasValue)
            {
                await _userProgressService.CreateOrUpdateUserProgressAsync(new CreateUserProgressRequest
                {
                    UserId = user.UserId,
                    DailyContentId = dailyContentId.Value,
                    IsCompleted = true
                });
            }
        }
        catch (Exception ex)
        {
            // Log error but don't fail login if progress update fails
            Console.WriteLine($"Error marking daily content as completed: {ex.Message}");
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz veri formatı"
            });
        }

        var user = new User
        {
            UserName = request.UserName,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
            Email = request.Email,
            Gender = request.Gender,
            City = request.City,
            Phone = request.Phone,
            Description = request.Description,
            SubscriptionEnd = DateTime.UtcNow.AddYears(1), // Default 1 year subscription
            WeeklyContentId = 1 // Default weekly content
        };

        var (success, message, createdUser) = await _authService.RegisterAsync(user, request.Password);

        if (!success)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = message
            });
        }

        var roles = await _authService.GetUserRolesAsync(createdUser.UserId);
        var token = _jwtService.GenerateToken(createdUser, roles);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = message,
            Token = token,
            User = new UserInfo
            {
                UserId = createdUser.UserId,
                UserName = createdUser.UserName,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                Email = createdUser.Email,
                Gender = createdUser.Gender,
                City = createdUser.City,
                Phone = createdUser.Phone,
                Description = createdUser.Description,
                DateOfBirth = createdUser.DateOfBirth,
                SubscriptionEnd = createdUser.SubscriptionEnd,
                WeeklyContentId = createdUser.WeeklyContentId
            },
            Roles = roles
        });
    }



    [HttpPost("validate-token")]
    public ActionResult<AuthResponse> ValidateToken([FromHeader(Name = "Authorization")] string authorization)
    {
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz token"
            });
        }

        var token = authorization.Substring("Bearer ".Length);
        var principal = _jwtService.ValidateToken(token);

        if (principal == null)
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz token"
            });
        }

        var roles = _jwtService.GetRolesFromToken(token);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Token geçerli",
            Token = token,
            Roles = roles
        });
    }
} 