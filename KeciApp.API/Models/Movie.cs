using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.Models;

public class Movie
{
   [Key]
   public int MovieId { get; set; }
   
  [Required] 
  public string MovieTitle { get; set; }

  public int order {get; set;}
}
