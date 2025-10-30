using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IWeeklyQuestionRepository
{
    Task<IEnumerable<WeeklyQuestion>> GetAllWeeklyQuestionsAsync();
    Task<WeeklyQuestion?> GetWeeklyQuestionByIdAsync(int weeklyQuestionId);
    Task<WeeklyQuestion> CreateWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion);
    Task<WeeklyQuestion> UpdateWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion);
    Task RemoveWeeklyQuestionAsync(WeeklyQuestion weeklyQuestion);
    Task<int> GetMaxWeeklyQuestionOrderAsync();
    Task<int> GetWeeklyQuestionIdByOrderAsync(int order);

}
