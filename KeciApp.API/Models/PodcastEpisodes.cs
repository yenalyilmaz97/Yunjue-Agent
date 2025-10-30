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
    [StringLength(100)]
    public string Title { get; set; }
    
    public string? Description { get; set; }
    
    [Required]
    [StringLength(255)]
    public string AudioLink { get; set; }
    
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