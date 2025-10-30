using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;
public class WeeklyQuestionAnswer
{
    [Key] public int WeeklyQuestionAnswerId { get; set; }
    [Required]
    [ForeignKey("User")] public int UserId { get; set; }
    [Required][ForeignKey("WeeklyQuestion")] public int WeeklyQuestionId { get; set; }
    [Required] public string WeeklyQuestionAnswerText { get; set; }
    
    //Navigation Properties
    public User User { get; set; }
    public WeeklyQuestion WeeklyQuestion { get; set; }
}
