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
    public string PdfLink { get; set; }

    [Required]
    public bool isActive { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }
}


