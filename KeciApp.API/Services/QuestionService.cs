using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Repositories;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class QuestionService : IQuestionService
{
    private readonly IQuestionRepository _questionRepository;
    private readonly IPodcastEpisodesRepository _episodesRepository;
    private readonly IMapper _mapper;

    public QuestionService(IQuestionRepository questionRepository, IPodcastEpisodesRepository episodesRepository, IMapper mapper)
    {
        _questionRepository = questionRepository;
        _episodesRepository = episodesRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsAsync()
    {
        var questions = await _questionRepository.GetAllQuestionsAsync();
        var responseDtos = _mapper.Map<IEnumerable<QuestionResponseDTO>>(questions);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var question = questions.FirstOrDefault(q => q.QuestionId == responseDto.QuestionId);
            if (question?.Episodes != null)
            {
                responseDto.SeriesTitle = question.Episodes.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = question.Episodes.Title;
            }
        }

        return responseDtos;
    }

    public async Task<IEnumerable<QuestionResponseDTO>> GetAllQuestionsByUserIdAsync(int userId)
    {
        var questions = await _questionRepository.GetAllQuestionsByUserIdAsync(userId);
        var responseDtos = _mapper.Map<IEnumerable<QuestionResponseDTO>>(questions);

        // Set series and episode titles manually, and include answers if answered
        foreach (var responseDto in responseDtos)
        {
            var question = questions.FirstOrDefault(q => q.QuestionId == responseDto.QuestionId);
            if (question?.Episodes != null)
            {
                responseDto.SeriesTitle = question.Episodes.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = question.Episodes.Title;
            }

            // Include answers if question is answered
            if (question != null && question.isAnswered && question.Answers != null && question.Answers.Any())
            {
                responseDto.Answers = _mapper.Map<List<AnswerResponseDTO>>(question.Answers);
                responseDto.Answer = responseDto.Answers.First();
            }
        }

        return responseDtos;
    }

    public async Task<IEnumerable<QuestionResponseDTO>> GetQuestionsByEpisodeIdAsync(int episodeId)
    {
        var questions = await _questionRepository.GetQuestionsByEpisodeIdAsync(episodeId);
        var responseDtos = _mapper.Map<IEnumerable<QuestionResponseDTO>>(questions);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var question = questions.FirstOrDefault(q => q.QuestionId == responseDto.QuestionId);
            if (question?.Episodes != null)
            {
                responseDto.SeriesTitle = question.Episodes.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = question.Episodes.Title;
            }
        }

        return responseDtos;
    }

    public async Task<QuestionResponseDTO?> GetQuestionByUserIdAndEpisodeIdAsync(int userId, int episodeId)
    {
        var question = await _questionRepository.GetQuestionAsync(userId, episodeId);
        if (question == null)
        {
            return null;
        }

        var responseDto = _mapper.Map<QuestionResponseDTO>(question);
        if (question.Episodes != null)
        {
            responseDto.SeriesTitle = question.Episodes.PodcastSeries?.Title ?? string.Empty;
            responseDto.EpisodeTitle = question.Episodes.Title;
        }

        // Include answers if exist
        if (question.Answers != null && question.Answers.Any())
        {
            responseDto.Answers = _mapper.Map<List<AnswerResponseDTO>>(question.Answers);
            responseDto.Answer = responseDto.Answers.First();
        }

        return responseDto;
    }

    public async Task<QuestionResponseDTO> AddQuestionToPodcastEpisodeAsync(AddQuestionRequest request)
    {
        // Get episode with series information for the question
        var episode = await _episodesRepository.GetPodcastEpisodeByIdAsync(request.EpisodeId);
        if (episode == null)
        {
            throw new InvalidOperationException("Episode not found");
        }

        var question = _mapper.Map<Questions>(request);
        question.CreatedAt = DateTime.UtcNow;
        question.UpdatedAt = DateTime.UtcNow;
        question.isAnswered = false;
        var addedQuestion = await _questionRepository.AddQuestionAsync(question);

        // Map to response DTO with series information
        var responseDto = _mapper.Map<QuestionResponseDTO>(addedQuestion);
        responseDto.SeriesTitle = episode.PodcastSeries?.Title ?? string.Empty;
        responseDto.EpisodeTitle = episode.Title;

        return responseDto;
    }

    public async Task<QuestionResponseDTO> EditQuestionOfPodcastEpisodeAsync(EditQuestionRequest request)
    {
        // Get existing question
        var existingQuestion = await _questionRepository.GetQuestionAsync(request.UserId, request.EpisodeId);
        if (existingQuestion == null)
        {
            throw new InvalidOperationException("Question not found");
        }

        // Check if question is already answered
        if (existingQuestion.isAnswered)
        {
            throw new InvalidOperationException("Cannot edit question that has been answered");
        }

        // Get episode with series information
        var episode = await _episodesRepository.GetPodcastEpisodeByIdAsync(request.EpisodeId);
        if (episode == null)
        {
            throw new InvalidOperationException("Episode not found");
        }

        // Update question
        existingQuestion.QuestionText = request.QuestionText;
        existingQuestion.UpdatedAt = DateTime.UtcNow;
        var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion);

        // Map to response DTO with series information
        var responseDto = _mapper.Map<QuestionResponseDTO>(updatedQuestion);
        responseDto.SeriesTitle = episode.PodcastSeries?.Title ?? string.Empty;
        responseDto.EpisodeTitle = episode.Title;

        return responseDto;
    }

    public async Task<QuestionResponseDTO> UpdateQuestionAsync(UpdateQuestionRequest request)
    {
        var existingQuestion = await _questionRepository.GetQuestionByIdAsync(request.QuestionId);
        if (existingQuestion == null)
        {
            throw new InvalidOperationException("Question not found");
        }

        // Update the question properties
        if (request.IsAnswered.HasValue)
        {
            existingQuestion.isAnswered = request.IsAnswered.Value;
        }
        if (!string.IsNullOrEmpty(request.QuestionText))
        {
            existingQuestion.QuestionText = request.QuestionText;
        }

        existingQuestion.UpdatedAt = DateTime.UtcNow;
        var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion);

        // Map to response DTO with series information
        var responseDto = _mapper.Map<QuestionResponseDTO>(updatedQuestion);
        if (updatedQuestion.Episodes != null)
        {
            responseDto.SeriesTitle = updatedQuestion.Episodes.PodcastSeries?.Title ?? string.Empty;
            responseDto.EpisodeTitle = updatedQuestion.Episodes.Title;
        }

        return responseDto;
    }

}
