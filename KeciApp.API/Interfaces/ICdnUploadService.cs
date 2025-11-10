namespace KeciApp.API.Interfaces;

public interface ICdnUploadService
{
    /// <summary>
    /// Uploads a file to the CDN server
    /// </summary>
    /// <param name="localFilePath">Path to the local file to upload</param>
    /// <param name="remotePath">Remote path on CDN (relative to CDN root)</param>
    /// <returns>True if upload successful, false otherwise</returns>
    Task<bool> UploadFileAsync(string localFilePath, string remotePath);

    /// <summary>
    /// Deletes a file from the CDN server
    /// </summary>
    /// <param name="remotePath">Remote path on CDN (relative to CDN root)</param>
    /// <returns>True if deletion successful, false otherwise</returns>
    Task<bool> DeleteFileAsync(string remotePath);

    /// <summary>
    /// Checks if a file exists on the CDN server
    /// </summary>
    /// <param name="remotePath">Remote path on CDN (relative to CDN root)</param>
    /// <returns>True if file exists, false otherwise</returns>
    Task<bool> FileExistsAsync(string remotePath);

    /// <summary>
    /// Deletes a directory and all its contents from the CDN server
    /// </summary>
    /// <param name="remotePath">Remote directory path on CDN (relative to CDN root)</param>
    /// <returns>True if deletion successful, false otherwise</returns>
    Task<bool> DeleteDirectoryAsync(string remotePath);
}

