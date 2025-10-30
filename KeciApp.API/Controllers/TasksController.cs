using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Services;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Controllers;
public class TasksController : ControllerBase
{
    private readonly ITasksService _tasksService;
    private readonly IWeeklyService _weeklyService;
    private readonly IWebHostEnvironment _env;

    public TasksController(ITasksService tasksService, IWeeklyService weeklyService, IWebHostEnvironment env)
    {
        _tasksService = tasksService;
        _weeklyService = weeklyService;
        _env = env;
    }

    [HttpGet("tasks")]
    public async Task<ActionResult<IEnumerable<TaskResponseDTO>>> GetAllTasks()
    {
        try
        {
            var tasks = await _tasksService.GetAllTasksAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("tasks")]
    public async Task<ActionResult<TaskResponseDTO>> AddTask([FromBody] CreateTaskRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var task = await _tasksService.AddTaskAsync(request);
            await _weeklyService.GenerateWeeklyContentAsync();
            return Ok(task);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPut("tasks")]
    public async Task<ActionResult<TaskResponseDTO>> EditTask([FromBody] EditTaskRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var task = await _tasksService.EditTaskAsync(request);
            return Ok(task);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpDelete("tasks/{taskId}")]
    public async Task<ActionResult<TaskResponseDTO>> DeleteTask(int taskId)
    {
        try
        {
            var task = await _tasksService.DeleteTaskAsync(taskId);
            return Ok(task);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("tasks/{taskId}")]
    public async Task<ActionResult<TaskResponseDTO>> GetTaskById(int taskId)
    {
        try
        {
            var task = await _tasksService.GetTaskByIdAsync(taskId);
            return Ok(task);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
