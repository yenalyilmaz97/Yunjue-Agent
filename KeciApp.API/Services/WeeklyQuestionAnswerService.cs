using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class WeeklyQuestionAnswerService : IWeeklyQuestionAnswerService
{
    private readonly IWeeklyQuestionAnswerRepository _weeklyQuestionAnswerRepository;
    private readonly IWeeklyQuestionRepository _weeklyQuestionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public WeeklyQuestionAnswerService(
        IWeeklyQuestionAnswerRepository weeklyQuestionAnswerRepository,
        IWeeklyQuestionRepository weeklyQuestionRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _weeklyQuestionAnswerRepository = weeklyQuestionAnswerRepository;
        _weeklyQuestionRepository = weeklyQuestionRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetAllWeeklyQuestionAnswersAsync()
    {
        var answers = await _weeklyQuestionAnswerRepository.GetAllWeeklyQuestionAnswersAsync();
        return _mapper.Map<IEnumerable<WeeklyQuestionAnswerResponseDTO>>(answers);
    }

    public async Task<WeeklyQuestionAnswerResponseDTO?> GetWeeklyQuestionAnswerByIdAsync(int weeklyQuestionAnswerId)
    {
        var answer = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswerByIdAsync(weeklyQuestionAnswerId);
        if (answer == null)
        {
            return null;
        }
        return _mapper.Map<WeeklyQuestionAnswerResponseDTO>(answer);
    }

    public async Task<WeeklyQuestionAnswerResponseDTO?> GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(int userId, int weeklyQuestionId)
    {
        var answer = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(userId, weeklyQuestionId);
        if (answer == null)
        {
            return null;
        }
        return _mapper.Map<WeeklyQuestionAnswerResponseDTO>(answer);
    }

    public async Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswersByUserIdAsync(int userId)
    {
        var answers = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswersByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<WeeklyQuestionAnswerResponseDTO>>(answers);
    }

    public async Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswersByQuestionIdAsync(int weeklyQuestionId)
    {
        var answers = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswersByQuestionIdAsync(weeklyQuestionId);
        return _mapper.Map<IEnumerable<WeeklyQuestionAnswerResponseDTO>>(answers);
    }

    public async Task<WeeklyQuestionAnswerResponseDTO> AnswerWeeklyQuestionAsync(AnswerWeeklyQuestionRequest request)
    {
        // Check if user exists
        var user = await _userRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Check if weekly question exists
        var weeklyQuestion = await _weeklyQuestionRepository.GetWeeklyQuestionByIdAsync(request.WeeklyQuestionId);
        if (weeklyQuestion == null)
        {
            throw new InvalidOperationException("Weekly question not found");
        }

        // Check if answer already exists
        var existingAnswer = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(
            request.UserId, request.WeeklyQuestionId);
        if (existingAnswer != null)
        {
            throw new InvalidOperationException("User has already answered this weekly question");
        }

        var weeklyQuestionAnswer = _mapper.Map<WeeklyQuestionAnswer>(request);
        var createdAnswer = await _weeklyQuestionAnswerRepository.CreateWeeklyQuestionAnswerAsync(weeklyQuestionAnswer);
        return _mapper.Map<WeeklyQuestionAnswerResponseDTO>(createdAnswer);
    }

    public async Task<WeeklyQuestionAnswerResponseDTO> UpdateWeeklyQuestionAnswerAsync(UpdateWeeklyQuestionAnswerRequest request)
    {
        var answer = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswerByIdAsync(request.WeeklyQuestionAnswerId);
        if (answer == null)
        {
            throw new InvalidOperationException("Weekly question answer not found");
        }

        answer.WeeklyQuestionAnswerText = request.WeeklyQuestionAnswerText;
        var updatedAnswer = await _weeklyQuestionAnswerRepository.UpdateWeeklyQuestionAnswerAsync(answer);
        return _mapper.Map<WeeklyQuestionAnswerResponseDTO>(updatedAnswer);
    }

    public async Task<WeeklyQuestionAnswerResponseDTO> DeleteWeeklyQuestionAnswerAsync(int weeklyQuestionAnswerId)
    {
        var answer = await _weeklyQuestionAnswerRepository.GetWeeklyQuestionAnswerByIdAsync(weeklyQuestionAnswerId);
        if (answer == null)
        {
            throw new InvalidOperationException("Weekly question answer not found");
        }

        await _weeklyQuestionAnswerRepository.RemoveWeeklyQuestionAnswerAsync(answer);
        return _mapper.Map<WeeklyQuestionAnswerResponseDTO>(answer);
    }
}

