namespace KeciApp.API.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(
        IFormFile file,
        string contentType, // "article" or "podcast-episode"
        string? seriesTitle, // Required for podcast-episode, null for article
        string title, // Episode/Article title
        int sequenceNumber // Sequence number for file naming
    );
    
    Task<string> UploadProfilePictureAsync(IFormFile file, string userName);
    
    Task<bool> DeleteFileAsync(string fileUrl);
    
    string GenerateSlug(string text);
}

