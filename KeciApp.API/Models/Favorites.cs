using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Favorites
{
    [Key]
    public int FavoriteId { get; set; }
    
    [Required]
    [ForeignKey("PodcastEpisode")]
    public int EpisodeId { get; set; }
    
    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    // Navigation Properties
    public User User { get; set; }
    public PodcastEpisodes PodcastEpisode { get; set; }
}