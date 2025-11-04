using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Affirmations
{
    [Key]
    public int AffirmationId { get; set; }

    [Required]
    public string Text { get; set; }

    public int order { get; set; }
}
