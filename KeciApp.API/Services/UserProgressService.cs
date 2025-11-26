using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class UserProgressService : IUserProgressService
{
    private readonly IUserProgressRepository _userProgressRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserProgressService(IUserProgressRepository userProgressRepository, IUserRepository userRepository, IMapper mapper)
    {
        _userProgressRepository = userProgressRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserProgressResponseDTO>> GetAllUserProgressByUserIdAsync(int userId)
    {
        var userProgresses = await _userProgressRepository.GetAllUserProgressByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<UserProgressResponseDTO>>(userProgresses);
    }

    public async Task<UserProgressResponseDTO?> GetUserProgressByUserIdAndWeekIdAsync(int userId, int weekId)
    {
        var userProgress = await _userProgressRepository.GetUserProgressByUserIdAndWeekIdAsync(userId, weekId);
        if (userProgress == null)
        {
            return null;
        }
        return _mapper.Map<UserProgressResponseDTO>(userProgress);
    }

    public async Task<UserProgressResponseDTO> CreateOrUpdateUserProgressAsync(CreateUserProgressRequest request)
    {
        // Validate user exists
        var user = await _userRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        UserProgress? existingProgress = null;

        // Check if progress already exists based on the type
        if (request.WeekId.HasValue)
        {
            existingProgress = await _userProgressRepository.GetUserProgressByUserIdAndWeekIdAsync(request.UserId, request.WeekId.Value);
        }
        else if (request.ArticleId.HasValue)
        {
            existingProgress = await _userProgressRepository.GetUserProgressByUserIdAndArticleIdAsync(request.UserId, request.ArticleId.Value);
        }
        else if (request.EpisodeId.HasValue)
        {
            existingProgress = await _userProgressRepository.GetUserProgressByUserIdAndEpisodeIdAsync(request.UserId, request.EpisodeId.Value);
        }

        if (existingProgress != null)
        {
            // Update existing progress
            existingProgress.isCompleted = request.IsCompleted;
            if (request.IsCompleted)
            {
                existingProgress.CompleteTime = DateTime.UtcNow;
            }
            var updatedProgress = await _userProgressRepository.UpdateUserProgressAsync(existingProgress);
            return _mapper.Map<UserProgressResponseDTO>(updatedProgress);
        }
        else
        {
            // Create new progress
            var userProgress = new UserProgress
            {
                UserId = request.UserId,
                WeekId = request.WeekId,
                ArticleId = request.ArticleId,
                EpisodeId = request.EpisodeId,
                isCompleted = request.IsCompleted,
                CompleteTime = request.IsCompleted ? DateTime.UtcNow : DateTime.MinValue
            };

            var createdProgress = await _userProgressRepository.CreateUserProgressAsync(userProgress);
            return _mapper.Map<UserProgressResponseDTO>(createdProgress);
        }
    }

    public async Task<UserProgressResponseDTO> UpdateUserProgressAsync(UpdateUserProgressRequest request)
    {
        var userProgress = await _userProgressRepository.GetUserProgressByIdAsync(request.UserProgressId);
        if (userProgress == null)
        {
            throw new InvalidOperationException("User progress not found");
        }

        userProgress.isCompleted = request.IsCompleted;
        if (request.IsCompleted)
        {
            userProgress.CompleteTime = DateTime.UtcNow;
        }

        var updatedProgress = await _userProgressRepository.UpdateUserProgressAsync(userProgress);
        return _mapper.Map<UserProgressResponseDTO>(updatedProgress);
    }

    public async Task<UserProgressResponseDTO> DeleteUserProgressAsync(int userProgressId)
    {
        var userProgress = await _userProgressRepository.GetUserProgressByIdAsync(userProgressId);
        if (userProgress == null)
        {
            throw new InvalidOperationException("User progress not found");
        }

        await _userProgressRepository.RemoveUserProgressAsync(userProgress);
        return _mapper.Map<UserProgressResponseDTO>(userProgress);
    }
}

