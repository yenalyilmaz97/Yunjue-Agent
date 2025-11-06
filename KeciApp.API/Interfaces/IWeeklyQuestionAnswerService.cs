using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface IWeeklyQuestionAnswerService
{
    Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetAllWeeklyQuestionAnswersAsync();
    Task<WeeklyQuestionAnswerResponseDTO?> GetWeeklyQuestionAnswerByIdAsync(int weeklyQuestionAnswerId);
    Task<WeeklyQuestionAnswerResponseDTO?> GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(int userId, int weeklyQuestionId);
    Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswersByUserIdAsync(int userId);
    Task<IEnumerable<WeeklyQuestionAnswerResponseDTO>> GetWeeklyQuestionAnswersByQuestionIdAsync(int weeklyQuestionId);
    Task<WeeklyQuestionAnswerResponseDTO> AnswerWeeklyQuestionAsync(AnswerWeeklyQuestionRequest request);
    Task<WeeklyQuestionAnswerResponseDTO> UpdateWeeklyQuestionAnswerAsync(UpdateWeeklyQuestionAnswerRequest request);
    Task<WeeklyQuestionAnswerResponseDTO> DeleteWeeklyQuestionAnswerAsync(int weeklyQuestionAnswerId);
}

