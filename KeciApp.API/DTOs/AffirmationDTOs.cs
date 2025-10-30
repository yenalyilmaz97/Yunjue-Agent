using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;
public class CreateAffirmationRequest
{
    [Required]
    public string AffirmationText { get; set; }
}

public class EditAffirmationRequest
{
    [Required]
    public int AffirmationId { get; set; }

    [Required]
    public string AffirmationText { get; set; }
}
public class AffirmationResponseDTO
{
    public int AffirmationId { get; set; }
    public string AffirmationText { get; set; }
    public int Order { get; set; }
}

