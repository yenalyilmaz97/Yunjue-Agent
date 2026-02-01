using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class Popup
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    [Required]
    public string ImageUrl { get; set; }

    public bool IsActive { get; set; }

    public bool Repeatable { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
