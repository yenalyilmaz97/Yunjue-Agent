using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class AddNoteRequest
{
    [Required]
    public int UserId { get; set; }
    
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    [Required]
    public string Title { get; set; }
    
    [Required]
    public string NoteText { get; set; }
}

public class EditNoteRequest
{
    [Required]
    public int UserId { get; set; }
    
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }

    [Required]
    public  string Title { get; set; }
    
    [Required]
    public string NoteText { get; set; }
}

public class DeleteNoteRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int EpisodeId { get; set; }
}
public class NoteResponseDTO
{
    public int NoteId { get; set; }
    public int UserId { get; set; }
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    public string? Title { get; set; }
    public string NoteText { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string UserName { get; set; }
    public string? EpisodeTitle { get; set; }
    public string? SeriesTitle { get; set; }
}

