using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class PodcastEpisodes
{
    [Key]
    public int EpisodesId { get; set; }
    
    [Required]
    [ForeignKey("PodcastSeries")]
    public int SeriesId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Title { get; set; }
    
    public string? Description { get; set; }
    
    [Required]
    public string ContentJson { get; set; } // JSON string containing EpisodeContent (audio, video, images)
    
    [Required]
    public int SequenceNumber { get; set; }
    
    [Required]
    public bool isActive { get; set; }

    public bool isVideo { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation Properties
    public PodcastSeries PodcastSeries { get; set; }
    public ICollection<Questions> Questions { get; set; }
    public ICollection<Notes> Notes { get; set; }
    public ICollection<Favorites> Favorites { get; set; }
}