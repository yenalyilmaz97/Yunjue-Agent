using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class WeeklyTask
{
    [Key]
    public int TaskId { get; set; }
    
    [Required]
    public string TaskDescription { get; set; }

    public int order {get; set;}
}