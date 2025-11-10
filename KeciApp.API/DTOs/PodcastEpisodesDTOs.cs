using System.ComponentModel.DataAnnotations;
using KeciApp.API.Models;

namespace KeciApp.API.DTOs;
public class CreatePodcastEpisodeRequest
{
    [Required]
    public int SeriesId { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Başlık en fazla 50 karakter olabilir")]
    public string Title { get; set; }

    [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string? Description { get; set; }

    [Required]
    public EpisodeContent Content { get; set; }

    [Required]
    public bool IsActive { get; set; }
    public bool? IsVideo { get; set; }
}

public class EditPodcastEpisodeRequest
{
    [Required]
    public int EpisodeId { get; set; }

    [Required]
    public int SeriesId { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Başlık en fazla 50 karakter olabilir")]
    public string Title { get; set; }

    [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string? Description { get; set; }

    [Required]
    public EpisodeContent Content { get; set; }

    [Required]
    public int SequenceNumber { get; set; }

    [Required]
    public bool IsActive { get; set; }
    public bool IsVideo { get; set; }
}

public class PodcastEpisodeResponseDTO
{
    public int EpisodesId { get; set; }
    public int SeriesId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public EpisodeContent Content { get; set; }
    public int SequenceNumber { get; set; }
    public bool IsActive { get; set; }
    public bool IsVideo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? SeriesTitle { get; set; }
    
    // Backward compatibility - will be removed in future
    [Obsolete("Use Content.Audio instead")]
    public string? AudioLink => Content?.Audio;
}

// Request DTO for file upload support
public class CreatePodcastEpisodeWithFilesRequest
{
    [Required]
    public int SeriesId { get; set; }

    [Required]
    [StringLength(50, ErrorMessage = "Başlık en fazla 50 karakter olabilir")]
    public string Title { get; set; }

    [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string? Description { get; set; }

    // File uploads (optional if URLs are provided)
    public IFormFile? AudioFile { get; set; }
    public IFormFile? VideoFile { get; set; }
    public List<IFormFile>? ImageFiles { get; set; }

    // Direct URLs (optional if files are provided)
    public string? AudioUrl { get; set; }
    public string? VideoUrl { get; set; }
    public List<string>? ImageUrls { get; set; }
    public string? ImageUrlsJson { get; set; } // For JSON string from FormData

    [Required]
    public bool IsActive { get; set; }
    public bool? IsVideo { get; set; }
}

