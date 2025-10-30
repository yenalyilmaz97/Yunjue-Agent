using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;

public interface ITasksService
{ 
    Task<IEnumerable<TaskResponseDTO>> GetAllTasksAsync();
    Task<TaskResponseDTO> GetTaskByIdAsync(int taskId);
    Task<TaskResponseDTO> AddTaskAsync(CreateTaskRequest request);
    Task<TaskResponseDTO> EditTaskAsync(EditTaskRequest request);
    Task<TaskResponseDTO> DeleteTaskAsync(int taskId);
}