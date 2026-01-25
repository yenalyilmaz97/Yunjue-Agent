using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

// User DTOs
public class CreateUserRequest
{
    [Required]
    [StringLength(25, ErrorMessage = "Kullanıcı adı en fazla 25 karakter olabilir")]
    public string UserName { get; set; }

    [Required]
    [StringLength(25, ErrorMessage = "Ad en fazla 25 karakter olabilir")]
    public string FirstName { get; set; }

    [Required]
    [StringLength(25, ErrorMessage = "Soyad en fazla 25 karakter olabilir")]
    public string LastName { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
    [StringLength(60, ErrorMessage = "Email en fazla 60 karakter olabilir")]
    public string Email { get; set; }

    [Required]
    public bool Gender { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Şehir en fazla 50 karakter olabilir")]
    public string City { get; set; }

    [Required]
    public string Phone { get; set; }

    [StringLength(255, ErrorMessage = "Açıklama en fazla 255 karakter olabilir")]
    public string Description { get; set; }

    [Required]
    [StringLength(30, ErrorMessage = "Şifre en fazla 30 karakter olabilir")]
    public string Password { get; set; }

    [Required]
    public DateTime SubscriptionEnd { get; set; }
    
    [Required]
    public int RoleId { get; set; }

    public bool dailyOrWeekly { get; set; }
}

public class EditUserRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [StringLength(25, ErrorMessage = "Kullanıcı adı en fazla 25 karakter olabilir")]
    public string UserName { get; set; }

    [Required]
    [StringLength(25, ErrorMessage = "Ad en fazla 25 karakter olabilir")]
    public string FirstName { get; set; }

    [Required]
    [StringLength(25, ErrorMessage = "Soyad en fazla 25 karakter olabilir")]
    public string LastName { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
    [StringLength(60, ErrorMessage = "Email en fazla 60 karakter olabilir")]
    public string Email { get; set; }

    [Required]
    public bool Gender { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Şehir en fazla 50 karakter olabilir")]
    public string City { get; set; }

    [Required]
    public string Phone { get; set; }

    [StringLength(255, ErrorMessage = "Açıklama en fazla 255 karakter olabilir")]
    public string Description { get; set; }

    [Required]
    public DateTime SubscriptionEnd { get; set; }
    public DateTime? KeciTimeEnd { get; set; }
    
    [Required]
    public int RoleId { get; set; }

    public int? DailyContentDayOrder { get; set; }

    [Required]
    public bool IsActive { get; set; }
}

public class AddKeciTimeDTO
{
    public int UserId { get; set; }
    public DateTime KeciTimeEnd { get; set; }
}

// Additional DTOs for specific operations
public class ChangePasswordRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [StringLength(30, ErrorMessage = "Şifre en fazla 30 karakter olabilir")]
    public string NewPassword { get; set; }
}

public class AddTimeRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [Range(1, 365, ErrorMessage = "Gün sayısı 1-365 arasında olmalıdır")]
    public int DayCount { get; set; }
}
public class UserResponseDTO
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Email { get; set; }
    public bool Gender { get; set; }
    public string City { get; set; }
    public string Phone { get; set; }
    public string Description { get; set; }
    public DateTime SubscriptionEnd { get; set; }
    public DateTime? KeciTimeEnd { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public int WeeklyContentId { get; set; }
    public int? DailyContentDayOrder { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
public class AssignWeeklyContentRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int WeeklyContentId { get; set; }
}

