using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class RefreshToken
{
    [Key]
    public int RefreshTokenId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [StringLength(256)]
    public string Token { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    [NotMapped]
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    // Navigation Property
    [ForeignKey("UserId")]
    public User User { get; set; }
}
