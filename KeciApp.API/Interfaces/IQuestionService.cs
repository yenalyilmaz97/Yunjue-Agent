using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IQuestionService
{
    Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsAsync();
    Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsByUserIdAsync(int userId);
    Task<IEnumerable<QuestionResponseDTO>> GetQuestionsByEpisodeIdAsync(int episodeId);
    Task<QuestionResponseDTO?> GetQuestionByUserIdAndEpisodeIdAsync(int userId, int episodeId);
    Task<QuestionResponseDTO> AddQuestionToPodcastEpisodeAsync(AddQuestionRequest request);
    Task<QuestionResponseDTO> EditQuestionOfPodcastEpisodeAsync(EditQuestionRequest request);
    Task<QuestionResponseDTO> UpdateQuestionAsync(UpdateQuestionRequest request);

}
