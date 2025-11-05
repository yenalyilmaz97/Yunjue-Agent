using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IWeeklyQuestionAnswerRepository
{
    Task<IEnumerable<WeeklyQuestionAnswer>> GetAllWeeklyQuestionAnswersAsync();
    Task<WeeklyQuestionAnswer?> GetWeeklyQuestionAnswerByIdAsync(int weeklyQuestionAnswerId);
    Task<WeeklyQuestionAnswer?> GetWeeklyQuestionAnswerByUserIdAndQuestionIdAsync(int userId, int weeklyQuestionId);
    Task<IEnumerable<WeeklyQuestionAnswer>> GetWeeklyQuestionAnswersByUserIdAsync(int userId);
    Task<IEnumerable<WeeklyQuestionAnswer>> GetWeeklyQuestionAnswersByQuestionIdAsync(int weeklyQuestionId);
    Task<WeeklyQuestionAnswer> CreateWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer);
    Task<WeeklyQuestionAnswer> UpdateWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer);
    Task RemoveWeeklyQuestionAnswerAsync(WeeklyQuestionAnswer weeklyQuestionAnswer);
}

