using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreateTaskRequest
{
    [Required]
    [StringLength(500, ErrorMessage = "Görev açıklaması en fazla 500 karakter olabilir")]
    public string TaskDescription { get; set; }
}
public class EditTaskRequest
{
    [Required]
    public int TaskId { get; set; }

    [Required]
    [StringLength(500, ErrorMessage = "Görev açıklaması en fazla 500 karakter olabilir")]
    public string TaskDescription { get; set; }
}
public class TaskResponseDTO
{
    public int TaskId { get; set; }
    public string TaskDescription { get; set; }
    public int Order { get; set; }
}

