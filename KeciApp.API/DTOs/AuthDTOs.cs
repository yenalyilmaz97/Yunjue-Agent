using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Email adresi gereklidir")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Şifre gereklidir")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    public string Password { get; set; }

    public bool RememberMe { get; set; } = false;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "Kullanıcı adı gereklidir")]
    [StringLength(25, ErrorMessage = "Kullanıcı adı en fazla 25 karakter olabilir")]
    public string UserName { get; set; }

    [Required(ErrorMessage = "Ad gereklidir")]
    [StringLength(25, ErrorMessage = "Ad en fazla 25 karakter olabilir")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Soyad gereklidir")]
    [StringLength(25, ErrorMessage = "Soyad en fazla 25 karakter olabilir")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "Doğum tarihi gereklidir")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "Email adresi gereklidir")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
    [StringLength(60, ErrorMessage = "Email en fazla 60 karakter olabilir")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Cinsiyet gereklidir")]
    public bool Gender { get; set; }

    [Required(ErrorMessage = "Şehir gereklidir")]
    [StringLength(50, ErrorMessage = "Şehir en fazla 50 karakter olabilir")]
    public string City { get; set; }

    [Required(ErrorMessage = "Telefon numarası gereklidir")]
    public string Phone { get; set; }

    [Required(ErrorMessage = "Açıklama gereklidir")]
    [StringLength(255, ErrorMessage = "Açıklama en fazla 255 karakter olabilir")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Şifre gereklidir")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır")]
    public string Password { get; set; }
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiration { get; set; }
    public UserInfo User { get; set; }
    public List<string> Roles { get; set; }
}

public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token gereklidir")]
    public string RefreshToken { get; set; }
}

public class RevokeTokenRequest
{
    [Required(ErrorMessage = "Refresh token gereklidir")]
    public string RefreshToken { get; set; }
}

public class UserInfo
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public bool Gender { get; set; }
    public string City { get; set; }
    public string Phone { get; set; }
    public string Description { get; set; }
    public DateTime DateOfBirth { get; set; }
    public DateTime SubscriptionEnd { get; set; }
    public bool IsWeeklyTaskCompleted { get; set; }
    public int WeeklyContentId { get; set; }
}