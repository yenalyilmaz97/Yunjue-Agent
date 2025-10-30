using Microsoft.AspNetCore.Mvc;
using KeciApp.API.Services;
using KeciApp.API.DTOs;
using KeciApp.API.Models;

namespace KeciApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtService _jwtService;

    public AuthController(IAuthService authService, IJwtService jwtService)
    {
        _authService = authService;
        _jwtService = jwtService;
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