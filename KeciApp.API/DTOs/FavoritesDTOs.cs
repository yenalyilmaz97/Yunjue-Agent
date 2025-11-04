using System.ComponentModel.DataAnnotations;
using KeciApp.API.Models;

namespace KeciApp.API.DTOs;

public class AddToFavoritesRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public FavoriteType FavoriteType { get; set; }
    
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    public int? AffirmationId { get; set; }
    public int? AphorismId { get; set; }
}

public class RemoveFromFavoritesRequest
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public FavoriteType FavoriteType { get; set; }
    
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    public int? AffirmationId { get; set; }
    public int? AphorismId { get; set; }
}

public class FavoriteResponseDTO
{
    public int FavoriteId { get; set; }
    public int UserId { get; set; }
    public FavoriteType FavoriteType { get; set; }
    public int? EpisodeId { get; set; }
    public int? ArticleId { get; set; }
    public int? AffirmationId { get; set; }
    public int? AphorismId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserName { get; set; }
    
    // Episode related
    public string? EpisodeTitle { get; set; }
    public string? SeriesTitle { get; set; }
    
    // Article related
    public string? ArticleTitle { get; set; }
    
    // Affirmation related
    public string? AffirmationText { get; set; }
    
    // Aphorism related
    public string? AphorismText { get; set; }
}
