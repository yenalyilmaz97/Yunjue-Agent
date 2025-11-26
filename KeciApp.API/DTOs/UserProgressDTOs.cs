using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreateUserProgressRequest
{
    [Required]
    public int UserId { get; set; }
    
    public int? WeekId { get; set; }
    
    public int? ArticleId { get; set; }
    
    public int? EpisodeId { get; set; }
    
    [Required]
    public bool IsCompleted { get; set; }
}

public class UpdateUserProgressRequest
{
    [Required]
    public int UserProgressId { get; set; }
    
    [Required]
    public bool IsCompleted { get; set; }
}

public class UserProgressResponseDTO
{
    public int UserProgressId { get; set; }
    public int UserId { get; set; }
    public int? WeekId { get; set; }
    public int? ArticleId { get; set; }
    public int? EpisodeId { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CompleteTime { get; set; }
    public WeeklyContentResponseDTO? WeeklyContent { get; set; }
    public ArticleResponseDTO? Article { get; set; }
    public PodcastEpisodeResponseDTO? PodcastEpisode { get; set; }
}

