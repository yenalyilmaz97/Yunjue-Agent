using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class AddQuestionRequest
{
    [Required]
    public int UserId { get; set; }
    
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    
    [Required]
    public string QuestionText { get; set; }
}

public class EditQuestionRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int EpisodeId { get; set; }
    
    [Required]
    public string QuestionText { get; set; }
}

public class UpdateQuestionRequest
{
    public int QuestionId { get; set; }
    
    public string? QuestionText { get; set; }
    
    public bool? IsAnswered { get; set; }
}
public class QuestionResponseDTO
{
    public int QuestionId { get; set; }
    public int UserId { get; set; }
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    public string QuestionText { get; set; }
    public bool IsAnswered { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UserName { get; set; }
    public string? EpisodeTitle { get; set; }
    public string? SeriesTitle { get; set; }
    public List<AnswerResponseDTO> Answers { get; set; } = new();
    public AnswerResponseDTO? Answer { get; set; }
}

