using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IWeeklyQuestionService
{
    Task<IEnumerable<WeeklyQuestionResponseDTO>> GetAllWeeklyQuestionsAsync();
    Task<WeeklyQuestionResponseDTO> GetWeeklyQuestionByIdAsync(int weeklyQuestionId);
    Task<WeeklyQuestionResponseDTO> AddWeeklyQuestionAsync(CreateWeeklyQuestionRequest request);
    Task<WeeklyQuestionResponseDTO> EditWeeklyQuestionAsync(EditWeeklyQuestionRequest request);
    Task<WeeklyQuestionResponseDTO> DeleteWeeklyQuestionAsync(int weeklyQuestionId);
}