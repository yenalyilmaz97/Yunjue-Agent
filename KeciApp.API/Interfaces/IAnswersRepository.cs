using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IAnswersRepository
{
    Task<IEnumerable<Answers>> GetAllAnswersAsync();
    Task<Answers?> GetAnswerByQuestionIdAsync(int questionId);
    Task<Answers?> GetAnswerByIdAsync(int answerId);
    Task<Answers> AddAnswerAsync(Answers answer);
    Task<Answers> UpdateAnswerAsync(Answers answer);
    Task RemoveAnswerAsync(Answers answer);
}
