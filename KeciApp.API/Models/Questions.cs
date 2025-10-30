using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Questions
{
    [Key]
    public int QuestionId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }
    
    [ForeignKey("Episodes")]
    public int? EpisodeId { get; set; }
    
    [ForeignKey("Article")]
    public int? ArticleId { get; set; }
    
    [Required]
    public string QuestionText { get; set; }
    
    [Required]
    public bool isAnswered { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Properties
    public User User { get; set; }
    public PodcastEpisodes? Episodes { get; set; }
    public Article? Article { get; set; }
    public ICollection<Answers> Answers { get; set; } = new List<Answers>();
}