using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using KeciApp.API.Data;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public interface IAuthService
{
    Task<(bool success, string message, User user, List<string> roles)> LoginAsync(string email, string password);
    Task<(bool success, string message, User user)> RegisterAsync(User user, string password);
    Task<List<string>> GetUserRolesAsync(int userId);
    Task<bool> HasRoleAsync(int userId, string roleName);
    Task<bool> HasAnyRoleAsync(int userId, params string[] roleNames);
    Task<RefreshToken> CreateRefreshTokenAsync(int userId, bool rememberMe);
    Task<RefreshToken> GetRefreshTokenAsync(string token);
    Task<bool> RevokeRefreshTokenAsync(string token);
    Task RevokeAllUserRefreshTokensAsync(int userId);
    Task<User> GetUserByIdAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IJwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<(bool success, string message, User user, List<string> roles)> LoginAsync(string email, string password)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return (false, "Kullanıcı bulunamadı", null, null);
        }

        if (!VerifyPassword(password, user.PasswordHash))
        {
            return (false, "Geçersiz şifre", null, null);
        }

        var roles = await GetUserRolesAsync(user.UserId);
        return (true, "Giriş başarılı", user, roles);
    }

    public async Task<(bool success, string message, User user)> RegisterAsync(User user, string password)
    {
        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return (false, "Bu email adresi zaten kullanılıyor", null);
        }

        // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.UserName == user.UserName))
        {
            return (false, "Bu kullanıcı adı zaten kullanılıyor", null);
        }

        // Hash password
        user.PasswordHash = HashPassword(password);
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        // Set default role (user)
        var defaultRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "user");
        if (defaultRole == null)
        {
            // Create default role if it doesn't exist
            defaultRole = new Role { RoleName = "user" };
            _context.Roles.Add(defaultRole);
            await _context.SaveChangesAsync();
        }

        user.RoleId = defaultRole.RoleId;

        // Add user to context
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (true, "Kayıt başarılı", user);
    }

    public async Task<List<string>> GetUserRolesAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user?.Role == null)
        {
            return new List<string>();
        }

        return new List<string> { user.Role.RoleName };
    }

    public async Task<bool> HasRoleAsync(int userId, string roleName)
    {
        return await _context.Users
            .Include(u => u.Role)
            .AnyAsync(u => u.UserId == userId && u.Role.RoleName == roleName);
    }

    public async Task<bool> HasAnyRoleAsync(int userId, params string[] roleNames)
    {
        var lowered = roleNames.Select(r => r.ToLower()).ToList();
        return await _context.Users
            .Include(u => u.Role)
            .AnyAsync(u => u.UserId == userId && lowered.Contains(u.Role.RoleName.ToLower()));
    }

    public async Task<RefreshToken> CreateRefreshTokenAsync(int userId, bool rememberMe)
    {
        var refreshTokenDays = rememberMe
            ? Convert.ToInt32(_configuration["Jwt:RememberMeRefreshTokenExpirationDays"] ?? "30")
            : Convert.ToInt32(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = _jwtService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<RefreshToken> GetRefreshTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(rt => rt.Token == token);
    }

    public async Task<bool> RevokeRefreshTokenAsync(string token)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            return false;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task RevokeAllUserRefreshTokensAsync(int userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<User> GetUserByIdAsync(int userId)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string hash)
    {
        var hashedPassword = HashPassword(password);
        return hashedPassword == hash;
    }
}
