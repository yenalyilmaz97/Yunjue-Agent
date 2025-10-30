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
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
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