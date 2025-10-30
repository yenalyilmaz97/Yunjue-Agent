using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KeciApp.API.Models;

public class WeeklyContent
{
    [Key]
    public int WeekId { get; set; }
    
    [Required]
    public int WeekOrder { get; set; }
    
    [ForeignKey("Music")]
    [Required]
    public int MusicId { get; set; }
    
    [ForeignKey("Movie")]
    [Required]
    public int MovieId { get; set; }
    
   [ForeignKey("Task")] 
   [Required]
   public int TaskId { get; set; }
   
   [ForeignKey("WeeklyQuestion")]
   [Required]
   public int WeeklyQuestionId { get; set; }
   
   //Navigation Properties
   public Music Music { get; set; }
   public Movie Movie { get; set; }
   public WeeklyTask Task { get; set; }
   public WeeklyQuestion WeeklyQuestion { get; set; }
}