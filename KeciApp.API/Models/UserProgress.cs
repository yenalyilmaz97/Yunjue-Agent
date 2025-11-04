using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class UserProgress
{
    [Key] public int UserProgressId { get; set; }

    [Required] [ForeignKey("User")] public int UserId { get; set; }

    [ForeignKey("WeeklyContent")] public int? WeekId { get; set; }
    [ForeignKey("Article")] public int? ArticleId { get; set; }

    [ForeignKey("PodcastEpisodes")] public int? EpisodeId { get; set; }
    public bool isCompleted { get; set; }
    public DateTime CompleteTime { get; set; }

    //Navigation Properties
    public User User { get; set; }
    public WeeklyContent? WeeklyContent { get; set; }
    public Article? Article { get; set; }
    public PodcastEpisodes? PodcastEpisodes { get; set; }

}
