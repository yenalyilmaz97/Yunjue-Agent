using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class WeeklyQuestionService : IWeeklyQuestionService
{
    private readonly IWeeklyQuestionRepository _weeklyQuestionRepository;
    private readonly IMapper _mapper;

    public WeeklyQuestionService(IWeeklyQuestionRepository weeklyQuestionRepository, IMapper mapper)
    {
        _weeklyQuestionRepository = weeklyQuestionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<WeeklyQuestionResponseDTO>> GetAllWeeklyQuestionsAsync()
    {
        var questions = await _weeklyQuestionRepository.GetAllWeeklyQuestionsAsync();
        return _mapper.Map<IEnumerable<WeeklyQuestionResponseDTO>>(questions);
    }

    public async Task<WeeklyQuestionResponseDTO> GetWeeklyQuestionByIdAsync(int weeklyQuestionId)
    {
        var weeklyQuestion = await _weeklyQuestionRepository.GetWeeklyQuestionByIdAsync(weeklyQuestionId);
        if (weeklyQuestion == null)
        {
            throw new InvalidOperationException("Weekly question not found");
        }

        return _mapper.Map<WeeklyQuestionResponseDTO>(weeklyQuestion);
    }

    public async Task<WeeklyQuestionResponseDTO> AddWeeklyQuestionAsync(CreateWeeklyQuestionRequest request)
    {
        var weeklyQuestion = _mapper.Map<WeeklyQuestion>(request);
        var maxOrder = await _weeklyQuestionRepository.GetMaxWeeklyQuestionOrderAsync();
        weeklyQuestion.order = maxOrder + 1;
        var createdQuestion = await _weeklyQuestionRepository.CreateWeeklyQuestionAsync(weeklyQuestion);
        return _mapper.Map<WeeklyQuestionResponseDTO>(createdQuestion);
    }

    public async Task<WeeklyQuestionResponseDTO> EditWeeklyQuestionAsync(EditWeeklyQuestionRequest request)
    {
        var weeklyQuestion = await _weeklyQuestionRepository.GetWeeklyQuestionByIdAsync(request.WeeklyQuestionId);
        if (weeklyQuestion == null)
        {
            throw new InvalidOperationException("Weekly question not found");
        }

        _mapper.Map(request, weeklyQuestion);
        var updatedQuestion = await _weeklyQuestionRepository.UpdateWeeklyQuestionAsync(weeklyQuestion);
        return _mapper.Map<WeeklyQuestionResponseDTO>(updatedQuestion);
    }

    public async Task<WeeklyQuestionResponseDTO> DeleteWeeklyQuestionAsync(int weeklyQuestionId)
    {
        var weeklyQuestion = await _weeklyQuestionRepository.GetWeeklyQuestionByIdAsync(weeklyQuestionId);
        if (weeklyQuestion == null)
        {
            throw new InvalidOperationException("Weekly question not found");
        }

        await _weeklyQuestionRepository.RemoveWeeklyQuestionAsync(weeklyQuestion);
        return _mapper.Map<WeeklyQuestionResponseDTO>(weeklyQuestion);
    }
}
