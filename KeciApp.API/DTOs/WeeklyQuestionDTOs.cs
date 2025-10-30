using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreateWeeklyQuestionRequest
{
    [Required]
    [StringLength(500, ErrorMessage = "Haftalık soru metni en fazla 500 karakter olabilir")]
    public string WeeklyQuestionText { get; set; }
}
public class EditWeeklyQuestionRequest
{
    [Required]
    public int WeeklyQuestionId { get; set; }
    
    [Required]
    [StringLength(500, ErrorMessage = "Haftalık soru metni en fazla 500 karakter olabilir")]
    public string WeeklyQuestionText { get; set; }
}
public class WeeklyQuestionResponseDTO
{
    public int WeeklyQuestionId { get; set; }
    public string WeeklyQuestionText { get; set; }
    public int Order { get; set; }
}

