using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class User
{
    [Key]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(25)]
    public string UserName { get; set; }
    
    [Required]
    [StringLength(25)]
    public string FirstName { get; set; }
    
    [Required]
    [StringLength(25)]
    public string LastName { get; set; }
    
    [Required]
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [EmailAddress]
    [StringLength(60)]
    public string Email { get; set; }
    
    [Required]
    public bool Gender { get; set; }

    [Required]
    [StringLength(50)]
    public string City { get; set; }

    [Required]
    public string Phone { get; set; }

    [Required]
    [StringLength(255)]
    public string Description { get; set; }
    
    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; }

    [Required]
    public DateTime SubscriptionEnd { get; set; }

    public DateTime? KeciTimeEnd { get; set; }

    public bool dailyOrWeekly { get; set; }
    
    [Required]
    public int WeeklyContentId { get; set; }
    
    [Required]
    public int RoleId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public DateTime UpdatedAt { get; set; }

    public string? ProfilePictureUrl { get; set; }

    // Navigation Properties
    [ForeignKey("RoleId")]
    public Role Role { get; set; }
    
    [ForeignKey("WeeklyContentId")]
    public WeeklyContent WeeklyContent { get; set; } 
    
    public ICollection<Notes> Notes { get; set; }
    public ICollection<Favorites> Favorites { get; set; }
    public ICollection<UserSeriesAccess> UserSeriesAccesses { get; set; }
    public ICollection<Questions> Questions { get; set; }
    public ICollection<Answers> Answers { get; set; }
}