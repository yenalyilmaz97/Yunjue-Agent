using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IQuestionRepository
{
    Task<IEnumerable<Questions>> GetAllQuestionsAsync();
    Task<IEnumerable<Questions>> GetAllQuestionsByUserIdAsync(int userId);
    Task<IEnumerable<Questions>> GetQuestionsByEpisodeIdAsync(int episodeId);
    Task<IEnumerable<Questions>> GetQuestionsByArticleIdAsync(int articleId);
    Task<Questions?> GetQuestionByIdAsync(int questionId);
    Task<Questions?> GetQuestionAsync(int userId, int episodeId);
    Task<Questions?> GetQuestionByArticleAsync(int userId, int articleId);
    Task<Questions> AddQuestionAsync(Questions question);
    Task<Questions> UpdateQuestionAsync(Questions question);
    Task<bool> DeleteQuestionAsync(int questionId);

}
