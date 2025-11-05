using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class DailyContentService : IDailyContentService
{
    private readonly IDailyContentRepository _dailyContentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public DailyContentService(IDailyContentRepository dailyContentRepository, IUserRepository userRepository, IMapper mapper)
    {
        _dailyContentRepository = dailyContentRepository;
        _userRepository = userRepository;
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

        // Calculate day order based on subscription start date
        // Using CreatedAt as subscription start, or calculate days since subscription
        var subscriptionStart = user.CreatedAt;
        var daysSinceStart = (DateTime.UtcNow - subscriptionStart).Days;
        
        // If dailyOrWeekly is true, use daily content; otherwise use weekly
        if (!user.dailyOrWeekly)
        {
            throw new InvalidOperationException("User is not on daily content plan");
        }

        // Calculate which day order to use (cycle through available days)
        var maxDayOrder = await _dailyContentRepository.GetMaxDayOrderAsync();
        if (maxDayOrder == 0)
        {
            throw new InvalidOperationException("No daily content available");
        }

        // Day order is 1-based, so add 1 to days since start, then modulo
        var dayOrder = (daysSinceStart % maxDayOrder) + 1;
        if (dayOrder == 0) dayOrder = maxDayOrder;

        var dailyContent = await _dailyContentRepository.GetDailyContentByDayOrderAsync(dayOrder);
        if (dailyContent == null)
        {
            // Fallback to day order 1 if calculated day doesn't exist
            dailyContent = await _dailyContentRepository.GetDailyContentByDayOrderAsync(1);
        }

        return dailyContent != null ? _mapper.Map<DailyContentResponseDTO>(dailyContent) : null;
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
}

