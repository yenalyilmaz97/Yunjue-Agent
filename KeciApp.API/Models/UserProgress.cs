using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class UserProgress
{
    [Key] public int UserProgressId { get; set; }

    [Required] [ForeignKey("User")] public int UserId { get; set; }

    [ForeignKey("Task")] public int? TaskId { get; set; }
    [ForeignKey("Article")] public int? ArticleId { get; set; }

    [ForeignKey("PodcastEpisodes")] public int? EpisodeId { get; set; }
    public bool isTaskCompleted { get; set; }
    public DateTime CompleteTime { get; set; }

    //Navigation Properties
    public User User { get; set; }
    public Task? Task { get; set; }
    public Article? Article { get; set; }
    public PodcastEpisodes? PodcastEpisodes { get; set; }

}
