using System.ComponentModel.DataAnnotations;

namespace KeciApp.API.DTOs;

public class AddToFavoritesRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int EpisodeId { get; set; }
}

public class RemoveFromFavoritesRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public int EpisodeId { get; set; }
}
public class FavoriteResponseDTO
{
    public int FavoriteId { get; set; }
    public int UserId { get; set; }
    public int EpisodeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserName { get; set; }
    public string EpisodeTitle { get; set; }
    public string SeriesTitle { get; set; }
}
