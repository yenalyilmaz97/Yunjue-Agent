using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class PodcastSeries
{
    [Key]
    public int SeriesId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Title { get; set; }

    public bool isVideo { get; set; }

    public bool isActive { get; set; }
    
    [Required]
    public string Description { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
    
    public ICollection<PodcastEpisodes> Episodes { get; set; }
}