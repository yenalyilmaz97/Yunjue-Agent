using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IAnswersService
{
    Task<IEnumerable<AnswerResponseDTO>> GetAllAnswersAsync();
    Task<AnswerResponseDTO> GetAnswerByQuestionIdAsync(int questionId);
    Task<AnswerResponseDTO> AnswerQuestionAsync(AnswerQuestionRequest request);
    Task<AnswerResponseDTO> EditAnswerAsync(EditAnswerRequest request);
    Task<AnswerResponseDTO> DeleteAnswerAsync(DeleteAnswerRequest request);
}
