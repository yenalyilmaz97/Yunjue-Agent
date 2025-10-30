using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Repositories;

namespace KeciApp.API.Services;

public class WeeklyService : IWeeklyService
{
    private readonly IWeeklyRepository _weeklyRepository;
    private readonly IMusicRepository _musicRepository;
    private readonly IMoviesRepository _moviesRepository;
    private readonly ITasksRepository _tasksRepository;
    private readonly IWeeklyQuestionRepository _weeklyQuestionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public WeeklyService(IWeeklyRepository weeklyRepository, IMusicRepository musicRepository, IMoviesRepository moviesRepository, ITasksRepository tasksRepository, IWeeklyQuestionRepository weeklyQuestionRepository, IUserRepository userRepository, IMapper mapper)
    {
        _weeklyRepository = weeklyRepository;
        _moviesRepository = moviesRepository;
        _musicRepository = musicRepository;
        _tasksRepository = tasksRepository;
        _weeklyQuestionRepository = weeklyQuestionRepository;
        _userRepository = userRepository; 
        _mapper = mapper;
    }

    // Weekly Content
    public async Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentAsync()
    {
        var content = await _weeklyRepository.GetAllWeeklyContentAsync();
        return _mapper.Map<IEnumerable<WeeklyContentResponseDTO>>(content);
    }

    public async Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentByWeekIdAsync(int weekId)
    {
        var content = await _weeklyRepository.GetAllWeeklyContentByWeekIdAsync(weekId);
        return _mapper.Map<IEnumerable<WeeklyContentResponseDTO>>(content);
    }

    public async Task<IEnumerable<WeeklyContentResponseDTO>> GetAllWeeklyContentByUserIdAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var content = await _weeklyRepository.GetAllWeeklyContentByWeekIdAsync(user.WeeklyContentId);
        return _mapper.Map<IEnumerable<WeeklyContentResponseDTO>>(content);
    }

    public async Task<WeeklyContentResponseDTO> AddWeeklyContentAsync(CreateWeeklyContentRequest request)
    {
        var weeklyContent = _mapper.Map<WeeklyContent>(request);
        var createdContent = await _weeklyRepository.CreateWeeklyContentAsync(weeklyContent);
        return _mapper.Map<WeeklyContentResponseDTO>(createdContent);
    }

    public async Task<bool> GenerateWeeklyContentAsync()
    {
        var lastOrder = await _weeklyRepository.GetMaxWeeklyContentOrderAsync();
        await Task.Delay(1);
        var lastOrderToGenerate = await _weeklyRepository.GetMaxPotentialOrderAsync();
        for (int i = lastOrder + 1; i <= lastOrderToGenerate; i++)
        {
            var musicId = await _musicRepository.GetMusicIdByOrderAsync(i);
            var movieId = await _moviesRepository.GetMovieIdByOrderAsync(i);
            var taskId = await _tasksRepository.GetTaskIdByOrderAsync(i);
            var weeklyQuestionId = await _weeklyQuestionRepository.GetWeeklyQuestionIdByOrderAsync(i);

            var request = new CreateWeeklyContentRequest
            {
                WeekOrder = i,
                MusicId = musicId,
                MovieId = movieId,
                TaskId = taskId,
                WeeklyQuestionId = weeklyQuestionId
            };
            var weeklyContent = _mapper.Map<WeeklyContent>(request);
            var createdContent = await _weeklyRepository.CreateWeeklyContentAsync(weeklyContent);
        }

        return true;
    }

    public async Task<WeeklyContentResponseDTO> EditWeeklyContentAsync(EditWeeklyContentRequest request)
    {
        var weeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(request.WeekId);
        if (weeklyContent == null)
        {
            throw new InvalidOperationException("Weekly content not found");
        }

        _mapper.Map(request, weeklyContent);
        var updatedContent = await _weeklyRepository.UpdateWeeklyContentAsync(weeklyContent);
        return _mapper.Map<WeeklyContentResponseDTO>(updatedContent);
    }

    public async Task<WeeklyContentResponseDTO> DeleteWeeklyContentAsync(int weeklyContentId)
    {
        var weeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(weeklyContentId);
        if (weeklyContent == null)
        {
            throw new InvalidOperationException("Weekly content not found");
        }

        await _weeklyRepository.RemoveWeeklyContentAsync(weeklyContent);
        return _mapper.Map<WeeklyContentResponseDTO>(weeklyContent);
    }

    // User Weekly Content
    public async Task<WeeklyContentResponseDTO> GetUserWeeklyContentAsync(int userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var weeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(user.WeeklyContentId);
        if (weeklyContent == null)
        {
            throw new InvalidOperationException("Weekly content not found for user");
        }

        return _mapper.Map<WeeklyContentResponseDTO>(weeklyContent);
    }

    public async Task<WeeklyContentResponseDTO> AssignWeeklyContentToUserAsync(AssignWeeklyContentRequest request)
    {
        var user = await _userRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var weeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(request.WeeklyContentId);
        if (weeklyContent == null)
        {
            throw new InvalidOperationException("Weekly content not found");
        }

        user.WeeklyContentId = request.WeeklyContentId;

        await _userRepository.UpdateUserAsync(user);

        return _mapper.Map<WeeklyContentResponseDTO>(weeklyContent);
    }



    public async Task<IEnumerable<WeeklyContentResponseDTO>> GetAvailableWeeksAsync()
    {
        var weeklyContents = await _weeklyRepository.GetAllWeeklyContentAsync();
        return _mapper.Map<IEnumerable<WeeklyContentResponseDTO>>(weeklyContents);
    }
}