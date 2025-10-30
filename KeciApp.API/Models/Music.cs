using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class Music
{
   [Key]
   public int MusicId { get; set; }
   
   [Required]
   public string MusicTitle { get; set; }
   
   [Required]
   public string MusicURL { get; set; }
 
   public string MusicDescription { get; set; }

   public int order {get; set;}
}