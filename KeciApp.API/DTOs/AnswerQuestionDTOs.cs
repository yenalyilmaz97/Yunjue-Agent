using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class AnswerQuestionRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int QuestionId { get; set; }
    
    [Required]
    [StringLength(1000, ErrorMessage = "Cevap metni en fazla 1000 karakter olabilir")]
    public string Answer { get; set; }
}

public class EditAnswerRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int AnswerId { get; set; }
    
    [Required]
    [StringLength(1000, ErrorMessage = "Cevap metni en fazla 1000 karakter olabilir")]
    public string Answer { get; set; }
}

public class DeleteAnswerRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int AnswerId { get; set; }
}
public class AnswerResponseDTO
{
    public int AnswerId { get; set; }
    public int QuestionId { get; set; }
    public int UserId { get; set; }
    public string AnswerText { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UserName { get; set; }
    public string QuestionText { get; set; }
}
