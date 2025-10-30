using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Article
{
    [Key]
    public int ArticleId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [Required]
    [StringLength(200)]
    public string Slug { get; set; }

    [Required]
    public string ContentHtml { get; set; }

    [StringLength(500)]
    public string? Excerpt { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    public int AuthorId { get; set; }

    [ForeignKey(nameof(AuthorId))]
    public User Author { get; set; }

    public bool IsPublished { get; set; }

    public DateTime? PublishedAt { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public DateTime UpdatedAt { get; set; }
}


