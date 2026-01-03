using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class DailyContentService : IDailyContentService
{
    private readonly IDailyContentRepository _dailyContentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserProgressRepository _userProgressRepository;
    private readonly IMapper _mapper;

    public DailyContentService(IDailyContentRepository dailyContentRepository, IUserRepository userRepository, IUserProgressRepository userProgressRepository, IMapper mapper)
    {
        _dailyContentRepository = dailyContentRepository;
        _userRepository = userRepository;
        _userProgressRepository = userProgressRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DailyContentResponseDTO>> GetAllDailyContentAsync()
    {
        var dailyContents = await _dailyContentRepository.GetAllDailyContentAsync();
        return _mapper.Map<IEnumerable<DailyContentResponseDTO>>(dailyContents);
    }

    public async Task<DailyContentResponseDTO?> GetDailyContentByIdAsync(int dailyContentId)
    {
        var dailyContent = await _dailyContentRepository.GetDailyContentByIdAsync(dailyContentId);
        if (dailyContent == null)
        {
            return null;
        }
        return _mapper.Map<DailyContentResponseDTO>(dailyContent);
    }

    public async Task<DailyContentResponseDTO?> GetDailyContentByDayOrderAsync(int dayOrder)
    {
        var dailyContent = await _dailyContentRepository.GetDailyContentByDayOrderAsync(dayOrder);
        if (dailyContent == null)
        {
            return null;
        }
        return _mapper.Map<DailyContentResponseDTO>(dailyContent);
    }

    public async Task<DailyContentResponseDTO?> GetUsersDailyContentOrderAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // If user has DailyContentId, return that daily content
        if (user.DailyContentId.HasValue)
        {
            var dailyContent = await _dailyContentRepository.GetDailyContentByIdAsync(user.DailyContentId.Value);
            if (dailyContent != null)
            {
                return _mapper.Map<DailyContentResponseDTO>(dailyContent);
            }
        }

        // If user doesn't have DailyContentId assigned, assign the first daily content
        var firstDailyContent = await _dailyContentRepository.GetDailyContentByDayOrderAsync(1);
        if (firstDailyContent != null)
        {
            // Assign first daily content to user
            user.DailyContentId = firstDailyContent.DailyContentId;
            await _userRepository.UpdateUserAsync(user);
            return _mapper.Map<DailyContentResponseDTO>(firstDailyContent);
        }

        // No daily content available
        throw new InvalidOperationException("No daily content available");
    }

    public async Task<DailyContentResponseDTO> CreateDailyContentAsync(CreateDailyContentRequest request)
    {
        var dailyContent = _mapper.Map<DailyContent>(request);
        var createdContent = await _dailyContentRepository.CreateDailyContentAsync(dailyContent);
        return _mapper.Map<DailyContentResponseDTO>(createdContent);
    }

    public async Task<DailyContentResponseDTO> UpdateDailyContentAsync(UpdateDailyContentRequest request)
    {
        var dailyContent = await _dailyContentRepository.GetDailyContentByIdAsync(request.DailyContentId);
        if (dailyContent == null)
        {
            throw new InvalidOperationException("Daily content not found");
        }

        _mapper.Map(request, dailyContent);
        var updatedContent = await _dailyContentRepository.UpdateDailyContentAsync(dailyContent);
        return _mapper.Map<DailyContentResponseDTO>(updatedContent);
    }

    public async Task<DailyContentResponseDTO> DeleteDailyContentAsync(int dailyContentId)
    {
        var dailyContent = await _dailyContentRepository.GetDailyContentByIdAsync(dailyContentId);
        if (dailyContent == null)
        {
            throw new InvalidOperationException("Daily content not found");
        }

        await _dailyContentRepository.RemoveDailyContentAsync(dailyContent);
        return _mapper.Map<DailyContentResponseDTO>(dailyContent);
    }

    public async Task<BulkUpdateDailyContentResponseDTO> IncrementDailyContentForAllUsersAsync()
    {
        var allUsers = await _userRepository.GetAllUsersAsync();
        int dailyUpdatedCount = 0;
        int skippedCount = 0;
        var maxDayOrder = await _dailyContentRepository.GetMaxDayOrderAsync();
        
        if (maxDayOrder == 0)
        {
            return new BulkUpdateDailyContentResponseDTO
            {
                UpdatedCount = 0,
                SkippedCount = 0,
                Message = "No daily content available."
            };
        }

        var usersWithDailyContent = allUsers.Where(u => u.DailyContentId.HasValue).ToList();
        
        foreach (var user in usersWithDailyContent)
        {
            // Check if user has progress record for current daily content (only update if progress exists)
            var currentDailyContent = await _dailyContentRepository.GetDailyContentByIdAsync(user.DailyContentId.Value);
            if (currentDailyContent != null)
            {
                // Check if user has progress for this daily content
                var userProgress = await _userProgressRepository.GetUserProgressByUserIdAndDailyContentIdAsync(user.UserId, currentDailyContent.DailyContentId);
                if (userProgress == null)
                {
                    // No progress record, skip this user
                    skippedCount++;
                    continue;
                }

                var nextDayOrder = currentDailyContent.DayOrder + 1;
                if (nextDayOrder > maxDayOrder)
                {
                    nextDayOrder = 1; // Cycle back to first day
                }
                
                var nextDailyContent = await _dailyContentRepository.GetDailyContentByDayOrderAsync(nextDayOrder);
                if (nextDailyContent != null)
                {
                    user.DailyContentId = nextDailyContent.DailyContentId;
                    await _userRepository.UpdateUserAsync(user);
                    dailyUpdatedCount++;
                }
                else
                {
                    skippedCount++;
                }
            }
            else
            {
                skippedCount++;
            }
        }

        return new BulkUpdateDailyContentResponseDTO
        {
            UpdatedCount = dailyUpdatedCount,
            SkippedCount = skippedCount,
            Message = $"Successfully updated daily content for {dailyUpdatedCount} users. Skipped {skippedCount} users."
        };
    }
}

