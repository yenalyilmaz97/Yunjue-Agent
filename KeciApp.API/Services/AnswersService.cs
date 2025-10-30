using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;
public class AnswersService : IAnswersService
{
    private readonly IAnswersRepository _answersRepository;
    private readonly IQuestionRepository _questionRepository;
    private readonly IMapper _mapper;
    public AnswersService(IAnswersRepository answersRepository, IQuestionRepository questionRepository, IMapper mapper)
    {
        _answersRepository = answersRepository;
        _questionRepository = questionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AnswerResponseDTO>> GetAllAnswersAsync()
    {
        var answers = await _answersRepository.GetAllAnswersAsync();
        return _mapper.Map<IEnumerable<AnswerResponseDTO>>(answers);
    }

    public async Task<AnswerResponseDTO> GetAnswerByQuestionIdAsync(int questionId)
    {
        var answer = await _answersRepository.GetAnswerByQuestionIdAsync(questionId);
        if (answer == null)
        {
            throw new InvalidOperationException("Answer not found");
        }

        return _mapper.Map<AnswerResponseDTO>(answer);
    }

    public async Task<AnswerResponseDTO> AnswerQuestionAsync(AnswerQuestionRequest request)
    {
        // Check if question exists
        var question = await _questionRepository.GetQuestionByIdAsync(request.QuestionId);
        if (question == null)
        {
            throw new InvalidOperationException("Question not found");
        }

        // Check if answer already exists
        var existingAnswer = await _answersRepository.GetAnswerByQuestionIdAsync(request.QuestionId);
        if (existingAnswer != null)
        {
            throw new InvalidOperationException("Question is already answered");
        }

        var answer = _mapper.Map<Answers>(request);
        var addedAnswer = await _answersRepository.AddAnswerAsync(answer);
        return _mapper.Map<AnswerResponseDTO>(addedAnswer);
    }

    public async Task<AnswerResponseDTO> EditAnswerAsync(EditAnswerRequest request)
    {
        var answerEntity = await _answersRepository.GetAnswerByIdAsync(request.AnswerId);
        if (answerEntity == null)
        {
            throw new InvalidOperationException("Answer not found");
        }

        answerEntity.AnswerText = request.Answer;
        var updatedAnswer = await _answersRepository.UpdateAnswerAsync(answerEntity);
        return _mapper.Map<AnswerResponseDTO>(updatedAnswer);
    }

    public async Task<AnswerResponseDTO> DeleteAnswerAsync(DeleteAnswerRequest request)
    {
        var answer = await _answersRepository.GetAnswerByIdAsync(request.AnswerId);
        if (answer == null)
        {
            throw new InvalidOperationException("Answer not found");
        }

        await _answersRepository.RemoveAnswerAsync(answer);
        return _mapper.Map<AnswerResponseDTO>(answer);
    }

}
