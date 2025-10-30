using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;
public class DailyContent
{
    [Key]
    public int DailyContentId { get; set; }

    [Required]
    public int DayOrder { get; set; }

    [ForeignKey("Affirmations")]
    public int AffirmationId { get; set; }

    [ForeignKey("Aphorisms")]
    public int AporismId { get; set; }
    
    //Navigation Properties
    public Affirmations Affirmations { get; set; }
    public Aphorisms Aphorisms { get; set; }
}
