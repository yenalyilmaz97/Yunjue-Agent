using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class CretaeAphorismRequest
{
    [Required]
    public string AphorismText { get; set; }
}
public class EditAphorismRequest
{
    [Required]
    public int AphorismId { get; set; }

    [Required]
    public string AphorismText { get; set; }
}
public class AphorismResponseDTO
{
    public int AphorismId { get; set; }
    public string AphorismText { get; set; }
    public int Order { get; set; }
}
