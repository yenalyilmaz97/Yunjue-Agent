using AutoMapper;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using System.Security.Cryptography;
using System.Text;
using KeciApp.API.Repositories;

namespace KeciApp.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IWeeklyRepository _weeklyRepository;
    private readonly IPodcastSeriesRepository _seriesRepository;
    private readonly IDailyContentRepository _dailyContentRepository;
    private readonly IUserSeriesAccessRepository _userSeriesAccessRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IUserSeriesAccessRepository userSeriesAccessRepository, IPodcastSeriesRepository seriesRepository, IWeeklyRepository weeklyRepository, IDailyContentRepository dailyContentRepository, IFileUploadService fileUploadService, IMapper mapper)
    {
        _userRepository = userRepository;
        _seriesRepository = seriesRepository;
        _weeklyRepository = weeklyRepository;
        _dailyContentRepository = dailyContentRepository;
        _userSeriesAccessRepository = userSeriesAccessRepository;
        _fileUploadService = fileUploadService;
        _mapper = mapper;
    }

    // User operations
    public async Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return _mapper.Map<IEnumerable<UserResponseDTO>>(users);
    }

    public async Task<UserResponseDTO> GetUserByIdAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        return _mapper.Map<UserResponseDTO>(user);
    }

    public async Task<UserResponseDTO> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        return _mapper.Map<UserResponseDTO>(user);
    }

    public async Task<IEnumerable<UserResponseDTO>> GetUsersByRoleIdAsync(int roleId)
    {
        var users = await _userRepository.GetUsersByRoleIdAsync(roleId);
        return _mapper.Map<IEnumerable<UserResponseDTO>>(users);
    }

    public async Task<UserResponseDTO> CreateUserAsync(CreateUserRequest request)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(request.Email))
            throw new InvalidOperationException($"Email {request.Email} is already registered");

        // Check if username already exists
        if (await _userRepository.UsernameExistsAsync(request.UserName))
            throw new InvalidOperationException($"Username {request.UserName} is already taken");

        // Check if role exists
        if (!await _userRepository.RoleExistsAsync(request.RoleId))
            throw new InvalidOperationException($"Role with ID {request.RoleId} not found");

        // Hash password
        var passwordHash = HashPassword(request.Password);

        // Map request to user entity
        var user = _mapper.Map<User>(request);
        user.PasswordHash = passwordHash;

        // Create user
        var createdUser = await _userRepository.CreateUserAsync(user);
        createdUser.WeeklyContentId = 1;
        createdUser.WeeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(1);

        if (createdUser != null)
        {
            var contents = await _seriesRepository.GetAllPodcastSeriesAsync();

            foreach (var content in contents)
            {
                var hasEpisodes = content.Episodes != null && content.Episodes.Any();
                if (!hasEpisodes)
                {
                    continue;
                }

                var req = new CreateUserSeriesAccessRequest
                {
                    UserId = createdUser.UserId,
                    SeriesId = content.SeriesId,
                    CurrentAccessibleSequence = 1,
                };

                var access = _mapper.Map<UserSeriesAccess>(req);
                var resp = await _userSeriesAccessRepository.CreateUserSeriesAccessAsync(access);
            }
        }
        return _mapper.Map<UserResponseDTO>(createdUser);
    }

    public async Task<UserResponseDTO> UpdateUserAsync(EditUserRequest request)
    {
        var existingUser = await _userRepository.GetUserByIdAsync(request.UserId);
        if (existingUser == null)
            throw new InvalidOperationException($"User with ID {request.UserId} not found");

        // Check if email is being changed and if it already exists
        if (request.Email != existingUser.Email && await _userRepository.EmailExistsAsync(request.Email))
            throw new InvalidOperationException($"Email {request.Email} is already registered");

        // Check if username is being changed and if it already exists
        if (request.UserName != existingUser.UserName && await _userRepository.UsernameExistsAsync(request.UserName))
            throw new InvalidOperationException($"Username {request.UserName} is already taken");

        // Check if role exists
        if (!await _userRepository.RoleExistsAsync(request.RoleId))
            throw new InvalidOperationException($"Role with ID {request.RoleId} not found");

        // Update existing user entity properties
        existingUser.UserName = request.UserName;
        existingUser.FirstName = request.FirstName;
        existingUser.LastName = request.LastName;
        existingUser.DateOfBirth = request.DateOfBirth;
        existingUser.Email = request.Email;
        existingUser.Gender = request.Gender;
        existingUser.City = request.City;
        existingUser.Phone = request.Phone;
        existingUser.Description = request.Description;
        existingUser.SubscriptionEnd = request.SubscriptionEnd;
        existingUser.RoleId = request.RoleId;
        
        // Update Daily Content by Day Order (Preferred)
        if (request.DailyContentDayOrder.HasValue)
        {
            var content = await _dailyContentRepository.GetDailyContentByDayOrderAsync(request.DailyContentDayOrder.Value);
            if (content != null)
            {
                existingUser.DailyContentId = content.DailyContentId;
            }
            else
            {
                // Optionally handle case where day order doesn't exist. 
                // For now, we ignore or could throw exception.
                // existingUser.DailyContentId = null; // Or keep existing? keeping existing.
            }
        }

        existingUser.UpdatedAt = DateTime.UtcNow;

        // Update user
        var updatedUser = await _userRepository.UpdateUserAsync(existingUser);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }

    public async Task<UserResponseDTO> AddKeciTimeToUser(AddKeciTimeDTO dto)
    {
        var existinguser = await _userRepository.GetUserByIdAsync(dto.UserId);
        if (existinguser != null)
            throw new InvalidOperationException($"User with ID {dto.UserId} not found");

        existinguser.KeciTimeEnd = dto.KeciTimeEnd;

        var updatedUser = await _userRepository.UpdateUserAsync(existinguser);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }

    public async Task<UserResponseDTO> DeleteUserAsync(int userId)
    {
        var deletedUser = await _userRepository.DeleteUserAsync(userId);
        return _mapper.Map<UserResponseDTO>(deletedUser);
    }

    public async Task<UserResponseDTO> AddTimeToUserAsync(int userId, int dayCount)
    {
        var updatedUser = await _userRepository.AddTimeToUserAsync(userId, dayCount);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }

    public async Task<UserResponseDTO> ChangePasswordAsync(int userId, string newPassword)
    {
        var passwordHash = HashPassword(newPassword);
        var updatedUser = await _userRepository.ChangePasswordAsync(userId, passwordHash);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }

    public async Task<UserResponseDTO> BanUserAsync(int userId)
    {
        var bannedUser = await _userRepository.BanUserAsync(userId);
        return _mapper.Map<UserResponseDTO>(bannedUser);
    }

    public async Task<UserResponseDTO> AssignRoleToUserAsync(int userId, int roleId)
    {
        var updatedUser = await _userRepository.AssignRoleToUserAsync(userId, roleId);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }
   
    // Helper method to hash passwords
    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public async Task<UserResponseDTO> UpdateProfilePictureAsync(int userId, string profilePictureUrl)
    {
        var existingUser = await _userRepository.GetUserByIdAsync(userId);
        if (existingUser == null)
            throw new InvalidOperationException($"User with ID {userId} not found");

        // Delete old profile picture if exists
        if (!string.IsNullOrWhiteSpace(existingUser.ProfilePictureUrl))
        {
            try
            {
                await _fileUploadService.DeleteFileAsync(existingUser.ProfilePictureUrl);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the update
                // Could add logging here if needed
            }
        }

        //Update profile picture URL
        existingUser.ProfilePictureUrl = profilePictureUrl;
        existingUser.UpdatedAt = DateTime.UtcNow;

        var updatedUser = await _userRepository.UpdateUserAsync(existingUser);
        return _mapper.Map<UserResponseDTO>(updatedUser);
    }
}
