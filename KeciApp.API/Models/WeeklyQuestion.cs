using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class WeeklyQuestion
{
    [Key] public int WeeklyQuestionId { get; set; }

    [Required]
    public string WeeklyQuestionText { get; set; }

    public int order {get; set;}
}