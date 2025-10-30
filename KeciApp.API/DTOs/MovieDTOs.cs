using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreateMovieRequest
{
    [Required]
    [StringLength(100, ErrorMessage = "Film başlığı en fazla 100 karakter olabilir")]
    public string MovieTitle { get; set; }
}

public class EditMovieRequest
{
    [Required]
    public int MovieId { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "Film başlığı en fazla 100 karakter olabilir")]
    public string MovieTitle { get; set; }
}
public class MovieResponseDTO
{
    public int MovieId { get; set; }
    public string MovieTitle { get; set; }
    public int Order { get; set; }
}

