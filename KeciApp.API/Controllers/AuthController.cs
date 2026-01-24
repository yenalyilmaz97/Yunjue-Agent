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
        var refreshToken = await _authService.CreateRefreshTokenAsync(user.UserId, request.RememberMe);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = message,
            Token = token,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiration = refreshToken.ExpiresAt,
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

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz veri formatı"
            });
        }

        var storedToken = await _authService.GetRefreshTokenAsync(request.RefreshToken);

        if (storedToken == null)
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Geçersiz refresh token"
            });
        }

        if (!storedToken.IsActive)
        {
            return Unauthorized(new AuthResponse
            {
                Success = false,
                Message = "Refresh token süresi dolmuş veya iptal edilmiş"
            });
        }

        var user = storedToken.User;
        var roles = await _authService.GetUserRolesAsync(user.UserId);

        // Revoke the old refresh token
        await _authService.RevokeRefreshTokenAsync(request.RefreshToken);

        // Generate new tokens
        var newAccessToken = _jwtService.GenerateToken(user, roles);

        // Determine if this was a "remember me" token based on its original expiration
        var originalDuration = (storedToken.ExpiresAt - storedToken.CreatedAt).TotalDays;
        var isRememberMe = originalDuration > 14; // If original duration was more than 14 days, it was a remember me token

        var newRefreshToken = await _authService.CreateRefreshTokenAsync(user.UserId, isRememberMe);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Token yenilendi",
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            RefreshTokenExpiration = newRefreshToken.ExpiresAt,
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

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { success = false, message = "Geçersiz veri formatı" });
        }

        var result = await _authService.RevokeRefreshTokenAsync(request.RefreshToken);

        if (!result)
        {
            return BadRequest(new { success = false, message = "Refresh token bulunamadı veya zaten iptal edilmiş" });
        }

        return Ok(new { success = true, message = "Token başarıyla iptal edildi" });
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

            var dailyContent = await _dailyContentService.GetUsersDailyContentOrderAsync(userId);

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
        var refreshToken = await _authService.CreateRefreshTokenAsync(createdUser.UserId, false);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = message,
            Token = token,
            RefreshToken = refreshToken.Token,
            RefreshTokenExpiration = refreshToken.ExpiresAt,
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
