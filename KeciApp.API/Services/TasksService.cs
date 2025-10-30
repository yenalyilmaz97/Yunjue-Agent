using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;

public class TasksService : ITasksService
{
    private readonly ITasksRepository _tasksRepository;
    private readonly IMapper _mapper;

    public TasksService(ITasksRepository tasksRepository, IMapper mapper)
    {
        _tasksRepository = tasksRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TaskResponseDTO>> GetAllTasksAsync()
    {
        var tasks = await _tasksRepository.GetAllTasksAsync();
        return _mapper.Map<IEnumerable<TaskResponseDTO>>(tasks);
    }

    public async Task<TaskResponseDTO> GetTaskByIdAsync(int taskId)
    {
        var task = await _tasksRepository.GetTaskByIdAsync(taskId);
        if (task == null)
        {
            throw new InvalidOperationException("Task not found");
        }

        return _mapper.Map<TaskResponseDTO>(task);
    }

    public async Task<TaskResponseDTO> AddTaskAsync(CreateTaskRequest request)
    {
        var task = _mapper.Map<WeeklyTask>(request);
        var maxOrder = await _tasksRepository.GetMaxTaskOrderAsync();
        task.order = maxOrder + 1;
        var createdTask = await _tasksRepository.CreateTaskAsync(task);
        return _mapper.Map<TaskResponseDTO>(createdTask);
    }

    public async Task<TaskResponseDTO> EditTaskAsync(EditTaskRequest request)
    {
        var task = await _tasksRepository.GetTaskByIdAsync(request.TaskId);
        if (task == null)
        {
            throw new InvalidOperationException("Task not found");
        }

        _mapper.Map(request, task);
        var updatedTask = await _tasksRepository.UpdateTaskAsync(task);
        return _mapper.Map<TaskResponseDTO>(updatedTask);
    }

    public async Task<TaskResponseDTO> DeleteTaskAsync(int taskId)
    {
        var task = await _tasksRepository.GetTaskByIdAsync(taskId);
        if (task == null)
        {
            throw new InvalidOperationException("Task not found");
        }

        await _tasksRepository.RemoveTaskAsync(task);
        return _mapper.Map<TaskResponseDTO>(task);
    }

}