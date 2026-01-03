using KeciApp.API.Interfaces;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace KeciApp.API.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileUploadService> _logger;
    private readonly ICdnUploadService _cdnUploadService;
    private readonly string _cdnBaseUrl;
    private readonly string _uploadBasePath;
    private readonly bool _uploadToCdn;

    public FileUploadService(
        IWebHostEnvironment env, 
        IConfiguration configuration, 
        ILogger<FileUploadService> logger,
        ICdnUploadService cdnUploadService)
    {
        _env = env;
        _configuration = configuration;
        _logger = logger;
        _cdnUploadService = cdnUploadService;
        _cdnBaseUrl = configuration["CDN:BaseUrl"] ?? "https://cdn.keciyibesle.com";
        _uploadBasePath = configuration["CDN:UploadPath"] ?? Path.Combine(_env.ContentRootPath, "wwwroot", "cdn");
        _uploadToCdn = configuration.GetValue<bool>("CDN:Enabled", true);
    }

    public async Task<string> UploadFileAsync(
        IFormFile file,
        string contentType,
        string? seriesTitle,
        string title,
        int sequenceNumber)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("UploadFileAsync called with null or empty file");
                throw new ArgumentException("File is empty or null");
            }


            // Validate contentType
            if (contentType != "article" && contentType != "podcast-episode")
            {
                throw new ArgumentException("ContentType must be 'article' or 'podcast-episode'");
            }

            // Validate seriesTitle for podcast-episode
            if (contentType == "podcast-episode" && string.IsNullOrWhiteSpace(seriesTitle))
            {
                throw new ArgumentException("SeriesTitle is required for podcast-episode");
            }

            // Generate slugs
            string seriesSlug = !string.IsNullOrWhiteSpace(seriesTitle) ? GenerateSlug(seriesTitle) : string.Empty;
            string titleSlug = GenerateSlug(title);

            // Build directory path
            string directoryPath;
            if (contentType == "article")
            {
                directoryPath = Path.Combine(_uploadBasePath, contentType, titleSlug);
            }
            else // podcast-episode
            {
                directoryPath = Path.Combine(_uploadBasePath, contentType, seriesSlug, titleSlug);
            }

            // Create directory if it doesn't exist
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            // Generate file name: {sequenceNumber}-{guid}.{extension}
            string fileExtension = Path.GetExtension(file.FileName);
            string guid = Guid.NewGuid().ToString();
            string fileName = $"{sequenceNumber}-{guid}{fileExtension}";
            string filePath = Path.Combine(directoryPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Verify file was saved
            if (!File.Exists(filePath))
            {
                _logger.LogError("Failed to save file: {FilePath}", filePath);
                throw new IOException($"Failed to save file to {filePath}");
            }

            // Build remote path for CDN
            string remotePath;
            if (contentType == "article")
            {
                remotePath = $"{contentType}/{titleSlug}/{fileName}";
            }
            else // podcast-episode
            {
                remotePath = $"{contentType}/{seriesSlug}/{titleSlug}/{fileName}";
            }

            // Upload to CDN if enabled
            if (_uploadToCdn)
            {
                try
                {
                    bool uploadSuccess = await _cdnUploadService.UploadFileAsync(filePath, remotePath);
                    if (uploadSuccess)
                    {
                        // Delete local file after successful CDN upload
                        try
                        {
                            File.Delete(filePath);
                        }
                        catch (Exception deleteEx)
                        {
                            _logger.LogWarning(deleteEx, "Failed to delete local file after CDN upload: {FilePath}", filePath);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("CDN upload failed. File kept locally: {RemotePath}", remotePath);
                    }
                }
                catch (Exception cdnEx)
                {
                    _logger.LogError(cdnEx, "CDN upload error. File kept locally: {RemotePath}", remotePath);
                }
            }

            // Build CDN URL
            string cdnUrl = $"{_cdnBaseUrl}/{remotePath}";

            return cdnUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file. ContentType: {ContentType}, Title: {Title}, FileName: {FileName}", 
                contentType, title, file?.FileName);
            throw;
        }
    }

    public async Task<string> UploadProfilePictureAsync(IFormFile file, string userName)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("UploadProfilePictureAsync called with null or empty file");
                throw new ArgumentException("File is empty or null");
            }

            // Validate file type (only images)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException("Only image files are allowed (jpg, jpeg, png, gif, webp)");
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 50 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                throw new ArgumentException("File size must be less than 50MB");
            }

            // Generate username slug
            string userNameSlug = GenerateSlug(userName);
            
            // Build directory path: user/profile/{username}
            string directoryPath = Path.Combine(_uploadBasePath, "user", "profile", userNameSlug);
            
            // Create directory if it doesn't exist
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            // Generate file name: profile.{extension}
            string fileName = $"profile{fileExtension}";
            string filePath = Path.Combine(directoryPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Verify file was saved
            if (!File.Exists(filePath))
            {
                _logger.LogError("Failed to save profile picture: {FilePath}", filePath);
                throw new IOException($"Failed to save file to {filePath}");
            }

            // Build remote path for CDN: user/profile/{username}/profile.{extension}
            string remotePath = $"user/profile/{userNameSlug}/{fileName}";

            // Upload to CDN if enabled
            if (_uploadToCdn)
            {
                try
                {
                    bool uploadSuccess = await _cdnUploadService.UploadFileAsync(filePath, remotePath);
                    if (uploadSuccess)
                    {
                        // Delete local file after successful CDN upload
                        try
                        {
                            File.Delete(filePath);
                        }
                        catch (Exception deleteEx)
                        {
                            _logger.LogWarning(deleteEx, "Failed to delete local file after CDN upload: {FilePath}", filePath);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("CDN upload failed. File kept locally: {RemotePath}", remotePath);
                    }
                }
                catch (Exception cdnEx)
                {
                    _logger.LogError(cdnEx, "CDN upload error. File kept locally: {RemotePath}", remotePath);
                }
            }

            // Build CDN URL
            string cdnUrl = $"{_cdnBaseUrl}/{remotePath}";

            return cdnUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile picture. UserName: {UserName}, FileName: {FileName}", 
                userName, file?.FileName);
            throw;
        }
    }

    public async Task<string> UploadMovieImageAsync(IFormFile file, string movieTitle, int movieId)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("UploadMovieImageAsync called with null or empty file");
                throw new ArgumentException("File is empty or null");
            }

            // Validate file type (only images)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException("Only image files are allowed (jpg, jpeg, png, gif, webp)");
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                throw new ArgumentException("File size must be less than 5MB");
            }

            // Generate movie title slug
            string movieTitleSlug = GenerateSlug(movieTitle);
            
            // Build directory path: movie/{movieId}-{slug}
            string directoryPath = Path.Combine(_uploadBasePath, "movie", $"{movieId}-{movieTitleSlug}");
            
            // Create directory if it doesn't exist
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            // Generate file name: image.{extension}
            string fileName = $"image{fileExtension}";
            string filePath = Path.Combine(directoryPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Verify file was saved
            if (!File.Exists(filePath))
            {
                _logger.LogError("Failed to save movie image: {FilePath}", filePath);
                throw new IOException($"Failed to save file to {filePath}");
            }

            // Build remote path for CDN: movie/{movieId}-{slug}/image.{extension}
            string remotePath = $"movie/{movieId}-{movieTitleSlug}/{fileName}";

            // Upload to CDN if enabled
            if (_uploadToCdn)
            {
                try
                {
                    bool uploadSuccess = await _cdnUploadService.UploadFileAsync(filePath, remotePath);
                    if (uploadSuccess)
                    {
                        // Delete local file after successful CDN upload
                        try
                        {
                            File.Delete(filePath);
                        }
                        catch (Exception deleteEx)
                        {
                            _logger.LogWarning(deleteEx, "Failed to delete local file after CDN upload: {FilePath}", filePath);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("CDN upload failed. File kept locally: {RemotePath}", remotePath);
                    }
                }
                catch (Exception cdnEx)
                {
                    _logger.LogError(cdnEx, "CDN upload error. File kept locally: {RemotePath}", remotePath);
                }
            }

            // Build CDN URL
            string cdnUrl = $"{_cdnBaseUrl}/{remotePath}";

            return cdnUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading movie image. MovieTitle: {MovieTitle}, MovieId: {MovieId}, FileName: {FileName}", 
                movieTitle, movieId, file?.FileName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
            {
                return false;
            }

            // Extract file path from CDN URL
            // Example: https://cdn.keciyibesle.com/podcast-episode/kirmizi-bolge/test/1-abc123.pdf
            // Should extract: podcast-episode/kirmizi-bolge/test/1-abc123.pdf

            Uri uri = new Uri(fileUrl);
            string relativePath = uri.AbsolutePath.TrimStart('/');

            // Remove CDN base path if present
            if (relativePath.StartsWith("cdn/", StringComparison.OrdinalIgnoreCase))
            {
                relativePath = relativePath.Substring(4);
            }

            // Delete from CDN if enabled
            bool cdnDeleted = false;
            if (_uploadToCdn)
            {
                cdnDeleted = await _cdnUploadService.DeleteFileAsync(relativePath);
            }

            // Also try to delete local file if it exists (in case CDN was disabled when file was uploaded)
            bool localDeleted = false;
            string filePath = Path.Combine(_uploadBasePath, relativePath);
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                    localDeleted = true;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete local file: {FilePath}", filePath);
                }
            }

            // Return true if at least one deletion succeeded
            return localDeleted || cdnDeleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file. URL: {FileUrl}", fileUrl);
            return false;
        }
    }

    public async Task<bool> DeleteMovieImageFolderAsync(int movieId, string movieTitle)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(movieTitle))
            {
                return false;
            }

            // Generate movie title slug
            string movieTitleSlug = GenerateSlug(movieTitle);
            
            // Build remote path for CDN: movie/{movieId}-{slug}/
            string remotePath = $"movie/{movieId}-{movieTitleSlug}";

            // Delete from CDN if enabled
            bool cdnDeleted = false;
            if (_uploadToCdn)
            {
                cdnDeleted = await _cdnUploadService.DeleteDirectoryAsync(remotePath);
            }

            // Also try to delete local directory if it exists
            bool localDeleted = false;
            string directoryPath = Path.Combine(_uploadBasePath, "movie", $"{movieId}-{movieTitleSlug}");
            if (Directory.Exists(directoryPath))
            {
                try
                {
                    Directory.Delete(directoryPath, true);
                    localDeleted = true;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete local movie directory: {DirectoryPath}", directoryPath);
                }
            }

            // Return true if at least one deletion succeeded
            return localDeleted || cdnDeleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting movie image folder. MovieTitle: {MovieTitle}, MovieId: {MovieId}", 
                movieTitle, movieId);
            return false;
        }
    }

    public string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        // Convert to lowercase
        string slug = text.ToLowerInvariant();

        // Replace Turkish characters
        slug = slug.Replace("ı", "i")
                   .Replace("ğ", "g")
                   .Replace("ü", "u")
                   .Replace("ş", "s")
                   .Replace("ö", "o")
                   .Replace("ç", "c")
                   .Replace("İ", "i")
                   .Replace("Ğ", "g")
                   .Replace("Ü", "u")
                   .Replace("Ş", "s")
                   .Replace("Ö", "o")
                   .Replace("Ç", "c");

        // Replace spaces and special characters with hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');

        return slug;
    }
}

