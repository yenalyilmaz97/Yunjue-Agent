using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreateMusicRequest
{
    [Required]
    [StringLength(100, ErrorMessage = "Müzik başlığı en fazla 100 karakter olabilir")]
    public string MusicTitle { get; set; }

    [Required]
    [StringLength(500, ErrorMessage = "Müzik URL'i en fazla 500 karakter olabilir")]
    public string MusicURL { get; set; }

    [StringLength(1000, ErrorMessage = "Müzik açıklaması en fazla 1000 karakter olabilir")]
    public string? MusicDescription { get; set; }
}
public class EditMusicRequest
{
    [Required]
    public int MusicId { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "Müzik başlığı en fazla 100 karakter olabilir")]
    public string MusicTitle { get; set; }

    [Required]
    [StringLength(500, ErrorMessage = "Müzik URL'i en fazla 500 karakter olabilir")]
    public string MusicURL { get; set; }

    [StringLength(1000, ErrorMessage = "Müzik açıklaması en fazla 1000 karakter olabilir")]
    public string? MusicDescription { get; set; }
}
public class MusicResponseDTO
{
    public int MusicId { get; set; }
    public string MusicTitle { get; set; }
    public string MusicURL { get; set; }
    public string? MusicDescription { get; set; }
    public int Order { get; set; }
}

