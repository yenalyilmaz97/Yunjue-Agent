using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public enum FavoriteType
{
    Episode = 1,
    Article = 2,
    Affirmation = 3,
    Aphorism = 4
}

public class Favorites
{
    [Key]
    public int FavoriteId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }
    
    [Required]
    public FavoriteType FavoriteType { get; set; }
    
    [ForeignKey("PodcastEpisode")]
    public int? EpisodeId { get; set; }
    
    [ForeignKey("Article")]
    public int? ArticleId { get; set; }
    
    [ForeignKey("Affirmations")]
    public int? AffirmationId { get; set; }
    
    [ForeignKey("Aphorisms")]
    public int? AphorismId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    // Navigation Properties
    public User User { get; set; }
    public PodcastEpisodes? PodcastEpisode { get; set; }
    public Article? Article { get; set; }
    public Affirmations? Affirmations { get; set; }
    public Aphorisms? Aphorisms { get; set; }
}