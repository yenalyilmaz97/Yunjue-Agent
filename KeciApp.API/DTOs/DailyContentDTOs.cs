using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CreateDailyContentRequest
{
    [Required]
    public int DayOrder { get; set; }

    [Required]
    public int AffirmationId { get; set; }

    [Required]
    public int AporismId { get; set; }
}

public class UpdateDailyContentRequest
{
    [Required]
    public int DailyContentId { get; set; }

    [Required]
    public int DayOrder { get; set; }

    [Required]
    public int AffirmationId { get; set; }

    [Required]
    public int AporismId { get; set; }
}

public class DailyContentResponseDTO
{
    public int DailyContentId { get; set; }
    public int DayOrder { get; set; }
    public int AffirmationId { get; set; }
    public int AporismId { get; set; }
    public AffirmationResponseDTO? Affirmation { get; set; }
    public AphorismResponseDTO? Aphorism { get; set; }
}

public class BulkUpdateDailyContentResponseDTO
{
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

