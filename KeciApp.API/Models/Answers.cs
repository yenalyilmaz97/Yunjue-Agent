using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Answers
{
    [Key]
    public int AnswerId { get; set; }
    
    [Required]
    [ForeignKey("Question")]
    public int QuestionId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }
    
    [Required]
    public string AnswerText { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Properties
    public Questions Question { get; set; }
    public User User { get; set; }
} 