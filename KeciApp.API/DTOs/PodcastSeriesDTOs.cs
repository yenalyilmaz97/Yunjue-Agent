using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreatePodcastSeriesRequest
{
    [Required]
    [StringLength(100, ErrorMessage = "Başlık en fazla 50 karakter olabilir")]
    public string Title { get; set; }

    public bool isVideo { get; set; }

    [Required]
    [StringLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir")]
    public string Description { get; set; }
}

public class EditPodcastSeriesRequest
{
    [Required]
    public int SeriesId { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "")]
    public string Title { get; set; }

    public bool isVideo { get; set; }
    public bool isActive { get; set; }

    [Required]
    [StringLength(1000, ErrorMessage = " ")]
    public string Description { get; set; }
}

public class PodcastSeriesResponseDTO
{
    public int SeriesId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public bool IsVideo { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PodcastEpisodeResponseDTO> Episodes { get; set; } = new();
}
