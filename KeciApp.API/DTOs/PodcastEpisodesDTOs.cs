using System.ComponentModel.DataAnnotations;

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
    [StringLength(255, ErrorMessage = "Audio link en fazla 255 karakter olabilir")]
    public string AudioLink { get; set; }

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
    [StringLength(255, ErrorMessage = "Audio link en fazla 255 karakter olabilir")]
    public string AudioLink { get; set; }

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
    public string AudioLink { get; set; }
    public int SequenceNumber { get; set; }
    public bool IsActive { get; set; }
    public bool IsVideo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? SeriesTitle { get; set; }
}

