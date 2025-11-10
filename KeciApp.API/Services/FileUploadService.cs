using KeciApp.API.Interfaces;
using System.Text;
using System.Text.RegularExpressions;

namespace KeciApp.API.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;
    private readonly string _cdnBaseUrl;
    private readonly string _uploadBasePath;

    public FileUploadService(IWebHostEnvironment env, IConfiguration configuration)
    {
        _env = env;
        _configuration = configuration;
        _cdnBaseUrl = configuration["CDN:BaseUrl"] ?? "https://cdn.keciyibesle.com";
        _uploadBasePath = configuration["CDN:UploadPath"] ?? Path.Combine(_env.ContentRootPath, "wwwroot", "cdn");
    }

    public async Task<string> UploadFileAsync(
        IFormFile file,
        string contentType,
        string? seriesTitle,
        string title,
        int sequenceNumber)
    {
        if (file == null || file.Length == 0)
        {
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

        // Build CDN URL
        string cdnUrl;
        if (contentType == "article")
        {
            cdnUrl = $"{_cdnBaseUrl}/{contentType}/{titleSlug}/{fileName}";
        }
        else // podcast-episode
        {
            cdnUrl = $"{_cdnBaseUrl}/{contentType}/{seriesSlug}/{titleSlug}/{fileName}";
        }

        return cdnUrl;
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

            string filePath = Path.Combine(_uploadBasePath, relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }

            return false;
        }
        catch
        {
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

