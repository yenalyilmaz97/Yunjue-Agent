using System.ComponentModel.DataAnnotations;
using KeciApp.API.Models;

namespace KeciApp.API.DTOs;

public class CreateUserSeriesAccessRequest
{
    [Required]
    public int UserId { get; set; }

    public int? SeriesId { get; set; }
   
    public int? ArticleId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Erişilebilir bölüm sayısı en az 1 olmalıdır")]
    public int CurrentAccessibleSequence { get; set; }
}

public class GrantAccessRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int SeriesId { get; set; }
    public int? ArticleId { get; set; }
}

public class RevokeAccessRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int? SeriesId { get; set; }
    public int? ArticleId { get; set; }
}
public class UserSeriesAccessResponseDTO
{
    public int UserSeriesAccessId { get; set; }
    public int UserId { get; set; }
    public int? SeriesId { get; set; }
    public int? ArticleId { get; set; }
    public int CurrentAccessibleSequence { get; set; }
    public DateTime UpdatedAt { get; set; }
    public UserResponseDTO? User { get; set; }
    public PodcastSeriesResponseDTO? PodcastSeries { get; set; }
    public Article? Article { get; set; }
}
public class UpdateUserSeriesAccessRequest
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Erişilebilir bölüm sayısı en az 1 olmalıdır")]
    public int CurrentAccessibleSequence { get; set; }
}


public class UserSeriesAccessStatsDTO
{
    public int TotalAccessRecords { get; set; }
    public int TotalUsers { get; set; }
    public int TotalSeries { get; set; }
    public double AverageAccessibleSequence { get; set; }
}

public class BulkGrantAccessResponseDTO
{
    public int TotalUsers { get; set; }
    public int TotalSeries { get; set; }
    public int GrantedCount { get; set; }
    public int SkippedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

