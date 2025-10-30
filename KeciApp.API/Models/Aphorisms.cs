using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class Aphorisms
{
    [Key]
    public int AphorismId { get; set; }

    [Required]
    public string AphorismText { get; set; }

    public int order { get; set; }
}