using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IQuestionService
{
    Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsAsync();
    Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsByUserIdAsync(int userId);
    Task<IEnumerable<QuestionResponseDTO>> GetQuestionsByEpisodeIdAsync(int episodeId);
    Task<IEnumerable<QuestionResponseDTO>> GetQuestionsByArticleIdAsync(int articleId);
    Task<QuestionResponseDTO?> GetQuestionByUserIdAndEpisodeIdAsync(int userId, int episodeId);
    Task<QuestionResponseDTO?> GetQuestionByUserIdAndArticleIdAsync(int userId, int articleId);
    Task<QuestionResponseDTO> AddQuestionAsync(AddQuestionRequest request);
    Task<QuestionResponseDTO> UpdateQuestionAsync(EditQuestionRequest request);
    Task<bool> DeleteQuestionAsync(int questionId);
    Task<QuestionResponseDTO> AddQuestionToPodcastEpisodeAsync(AddQuestionRequest request);


}
