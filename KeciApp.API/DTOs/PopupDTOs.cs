using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreatePopupRequest
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    [Required]
    public IFormFile Image { get; set; }

    [Required]
    public bool Repeatable { get; set; }
}

public class UpdatePopupRequest
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; }

    public IFormFile? Image { get; set; }

    [Required]
    public bool Repeatable { get; set; }
}

public class PopupResponseDTO
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string ImageUrl { get; set; }
    public bool Repeatable { get; set; }
}
