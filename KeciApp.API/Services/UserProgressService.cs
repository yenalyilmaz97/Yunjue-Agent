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

        // Validate that at least one content ID is provided
        if (!request.WeekId.HasValue && 
            !request.ArticleId.HasValue && 
            !request.DailyContentId.HasValue && 
            !request.EpisodeId.HasValue)
        {
            throw new ArgumentException("At least one content identifier (WeekId, ArticleId, DailyContentId, or EpisodeId) must be provided.");
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
        else if (request.DailyContentId.HasValue)
        {
            existingProgress = await _userProgressRepository.GetUserProgressByUserIdAndDailyContentIdAsync(request.UserId, request.DailyContentId.Value);
        }
        else if (request.EpisodeId.HasValue)
        {
            existingProgress = await _userProgressRepository.GetUserProgressByUserIdAndEpisodeIdAsync(request.UserId, request.EpisodeId.Value);
        }

        if (existingProgress != null)
        {
            // If user is trying to mark as completed but it's already completed, skip the update
            if (request.IsCompleted && existingProgress.isCompleted)
            {
                // Already completed, return existing progress without updating
                return _mapper.Map<UserProgressResponseDTO>(existingProgress);
            }

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
            // Double-check if progress exists (race condition protection)
            UserProgress? doubleCheckProgress = null;
            if (request.WeekId.HasValue)
            {
                doubleCheckProgress = await _userProgressRepository.GetUserProgressByUserIdAndWeekIdAsync(request.UserId, request.WeekId.Value);
            }
            else if (request.ArticleId.HasValue)
            {
                doubleCheckProgress = await _userProgressRepository.GetUserProgressByUserIdAndArticleIdAsync(request.UserId, request.ArticleId.Value);
            }
            else if (request.DailyContentId.HasValue)
            {
                doubleCheckProgress = await _userProgressRepository.GetUserProgressByUserIdAndDailyContentIdAsync(request.UserId, request.DailyContentId.Value);
            }
            else if (request.EpisodeId.HasValue)
            {
                doubleCheckProgress = await _userProgressRepository.GetUserProgressByUserIdAndEpisodeIdAsync(request.UserId, request.EpisodeId.Value);
            }

            if (doubleCheckProgress != null)
            {
                // Progress was created between our checks, update it instead
                doubleCheckProgress.isCompleted = request.IsCompleted;
                if (request.IsCompleted)
                {
                    doubleCheckProgress.CompleteTime = DateTime.UtcNow;
                }
                var updatedProgress = await _userProgressRepository.UpdateUserProgressAsync(doubleCheckProgress);
                return _mapper.Map<UserProgressResponseDTO>(updatedProgress);
            }

            var userProgress = new UserProgress
            {
                UserId = request.UserId,
                WeekId = request.WeekId,
                ArticleId = request.ArticleId,
                DailyContentId = request.DailyContentId,
                EpisodeId = request.EpisodeId,
                isCompleted = request.IsCompleted,
                CompleteTime = request.IsCompleted ? DateTime.UtcNow : DateTime.MinValue
            };

            try
            {
                var createdProgress = await _userProgressRepository.CreateUserProgressAsync(userProgress);
                return _mapper.Map<UserProgressResponseDTO>(createdProgress);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                // Handle unique constraint violation (race condition)
                if (ex.InnerException?.Message?.Contains("UNIQUE constraint") == true || 
                    ex.InnerException?.Message?.Contains("duplicate key") == true)
                {
                    // Progress was created by another thread, fetch and return it
                    UserProgress? existingProgressAfterException = null;
                    if (request.WeekId.HasValue)
                    {
                        existingProgressAfterException = await _userProgressRepository.GetUserProgressByUserIdAndWeekIdAsync(request.UserId, request.WeekId.Value);
                    }
                    else if (request.ArticleId.HasValue)
                    {
                        existingProgressAfterException = await _userProgressRepository.GetUserProgressByUserIdAndArticleIdAsync(request.UserId, request.ArticleId.Value);
                    }
                    else if (request.DailyContentId.HasValue)
                    {
                        existingProgressAfterException = await _userProgressRepository.GetUserProgressByUserIdAndDailyContentIdAsync(request.UserId, request.DailyContentId.Value);
                    }
                    else if (request.EpisodeId.HasValue)
                    {
                        existingProgressAfterException = await _userProgressRepository.GetUserProgressByUserIdAndEpisodeIdAsync(request.UserId, request.EpisodeId.Value);
                    }

                    if (existingProgressAfterException != null)
                    {
                        // Update if needed
                        if (request.IsCompleted && !existingProgressAfterException.isCompleted)
                        {
                            existingProgressAfterException.isCompleted = true;
                            existingProgressAfterException.CompleteTime = DateTime.UtcNow;
                            var updatedProgress = await _userProgressRepository.UpdateUserProgressAsync(existingProgressAfterException);
                            return _mapper.Map<UserProgressResponseDTO>(updatedProgress);
                        }
                        return _mapper.Map<UserProgressResponseDTO>(existingProgressAfterException);
                    }
                }
                throw; // Re-throw if it's not a unique constraint violation
            }
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

