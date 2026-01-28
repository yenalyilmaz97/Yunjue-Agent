using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace KeciApp.API.DTOs;
public class CreateMovieRequest
{
    [Required(ErrorMessage = "Film başlığı gereklidir")]
    [StringLength(100, ErrorMessage = "Film başlığı en fazla 100 karakter olabilir")]
    public string MovieTitle { get; set; }
    public string MovieDescription { get; set; }
    
    public IFormFile? ImageFile { get; set; }
}

public class EditMovieRequest
{
    [Required]
    public int MovieId { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "Film başlığı en fazla 100 karakter olabilir")]
    public string MovieTitle { get; set; }
    public string MovieDescription { get; set; }
}
public class MovieResponseDTO
{
    public int MovieId { get; set; }
    public string MovieTitle { get; set; }
    public int Order { get; set; }
    public string? ImageUrl { get; set; }
    public string MovieDescription { get; set; }
}

// Request DTO for movie image upload
public class UploadMovieImageRequest
{
    public IFormFile File { get; set; }
}

