using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class Role
{
    [Key]
    public int RoleId { get; set; }
    
    [Required]
    public string RoleName { get; set; }
    
    // Navigation Property
    public ICollection<User> Users { get; set; }
}