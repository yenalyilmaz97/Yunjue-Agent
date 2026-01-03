using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class UserSeriesAccess
{
    [Key] public int UserSeriesAccessId { get; set; }

    [Required] [ForeignKey("User")] public int UserId { get; set; }

    [ForeignKey("Article")] public int? ArticleId { get; set; }

    [ForeignKey("PodcastSeries")]
    public int? SeriesId { get; set; }

    [Required] public int CurrentAccessibleSequence { get; set; }

    [Required] public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; }
    public PodcastSeries PodcastSeries { get; set; }
    public Article? Article { get; set; }
}