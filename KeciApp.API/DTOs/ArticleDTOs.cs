using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreateArticleRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [Required]
    public string PdfLink { get; set; }

    public bool isActive { get; set; }
}

public class EditArticleRequest
{
    [Required]
    public int ArticleId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [Required]
    public string PdfLink { get; set; }

    public bool isActive { get; set; }
}

public class ArticleResponseDTO
{
    public int ArticleId { get; set; }
    public string Title { get; set; }
    public string PdfLink { get; set; }
    public bool isActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

