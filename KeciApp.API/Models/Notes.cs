using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Notes
{
    [Key]
    public int NoteId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }
    
    [ForeignKey("PodcastEpisode")]
    public int? EpisodeId { get; set; }

    [ForeignKey("Article")]
    public int? ArticleId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string NoteText { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Properties
    public User User { get; set; }
    public PodcastEpisodes? PodcastEpisode { get; set; }
    public Article? Article { get; set; }
}