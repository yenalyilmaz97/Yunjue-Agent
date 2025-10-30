using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

// Weekly Content DTOs
public class CreateWeeklyContentRequest
{
    [Required]
    public int WeekOrder { get; set; }
    
    [Required]
    public int MusicId { get; set; }
    
    [Required]
    public int MovieId { get; set; }
    
    [Required]
    public int TaskId { get; set; }
    
    [Required]
    public int WeeklyQuestionId { get; set; }
}

public class EditWeeklyContentRequest
{
    [Required]
    public int WeekId { get; set; }
    
    [Required]
    public int WeekOrder { get; set; }
    
    [Required]
    public int MusicId { get; set; }
    
    [Required]
    public int MovieId { get; set; }
    
    [Required]
    public int TaskId { get; set; }
    
    [Required]
    public int WeeklyQuestionId { get; set; }
}

public class WeeklyContentResponseDTO
{
    public int WeekId { get; set; }
    public int WeekOrder { get; set; }
    public int MusicId { get; set; }
    public int MovieId { get; set; }
    public int TaskId { get; set; }
    public int WeeklyQuestionId { get; set; }
    public MusicResponseDTO Music { get; set; }
    public MovieResponseDTO Movie { get; set; }
    public TaskResponseDTO Task { get; set; }
    public WeeklyQuestionResponseDTO WeeklyQuestion { get; set; }
}

