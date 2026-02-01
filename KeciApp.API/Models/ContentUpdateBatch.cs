using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class ContentUpdateBatch
{
    [Key]
    public Guid BatchId { get; set; }

    [Required]
    [StringLength(50)]
    public string UpdateType { get; set; } = string.Empty; // "Daily", "Weekly", etc.

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public string UpdateData { get; set; } = string.Empty; // JSON blob

    [StringLength(200)]
    public string? Description { get; set; }
}
