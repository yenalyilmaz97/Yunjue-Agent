using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreateRoleRequest
{
    [Required]
    [StringLength(50, ErrorMessage = "Rol Adı en fazla 50 karakter olabilir")]
    public string RoleName { get; set; }
}

public class EditRoleRequest
{
    [Required]
    public int RoleId { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Rol Adı en fazla 50 karakter olabilir")]
    public string RoleName { get; set; }
}

public class RoleResponseDTO
{
    public int RoleId { get; set; }
    public string RoleName { get; set; }
}
public class AssignRoleRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int RoleId { get; set; }
}

