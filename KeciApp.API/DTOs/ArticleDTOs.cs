using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreateArticleRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [StringLength(500)]
    public string? Excerpt { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    public string ContentHtml { get; set; }

    public bool IsPublished { get; set; }
}

public class EditArticleRequest
{
    [Required]
    public int ArticleId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [StringLength(500)]
    public string? Excerpt { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    public string ContentHtml { get; set; }

    public bool IsPublished { get; set; }
}

public class ArticleResponseDTO
{
    public int ArticleId { get; set; }
    public string Title { get; set; }
    public string Slug { get; set; }
    public string ContentHtml { get; set; }
    public string? Excerpt { get; set; }
    public string? CoverImageUrl { get; set; }
    public int AuthorId { get; set; }
    public string AuthorUserName { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

