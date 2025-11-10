using KeciApp.API.Interfaces;
using Microsoft.Extensions.Logging;
using System.Net;
using Renci.SshNet;
using Renci.SshNet.Sftp;
using SshConnectionInfo = Renci.SshNet.ConnectionInfo;

namespace KeciApp.API.Services;

/// <summary>
/// Service for uploading files to CDN server via FTP/SFTP
/// </summary>
public class CdnUploadService : ICdnUploadService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<CdnUploadService> _logger;
    private readonly string _cdnHost;
    private readonly int _cdnPort;
    private readonly string _cdnUsername;
    private readonly string _cdnPassword;
    private readonly string _cdnBasePath;
    private readonly bool _useSftp;
    private readonly bool _enabled;

    public CdnUploadService(IConfiguration configuration, ILogger<CdnUploadService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Read CDN configuration
        _enabled = _configuration.GetValue<bool>("CDN:Enabled", true);
        _cdnHost = _configuration["CDN:Host"] ?? string.Empty;
        _cdnPort = _configuration.GetValue<int>("CDN:Port", 22); // Default SFTP port
        _cdnUsername = _configuration["CDN:Username"] ?? string.Empty;
        _cdnPassword = _configuration["CDN:Password"] ?? string.Empty;
        _cdnBasePath = _configuration["CDN:BasePath"] ?? "/";
        _useSftp = _configuration.GetValue<bool>("CDN:UseSftp", true); // Default to SFTP

        if (_enabled)
        {
            if (string.IsNullOrWhiteSpace(_cdnHost))
            {
                _logger.LogWarning("CDN upload is enabled but CDN:Host is not configured. CDN uploads will be skipped.");
                _enabled = false;
            }
            else if (string.IsNullOrWhiteSpace(_cdnUsername) || string.IsNullOrWhiteSpace(_cdnPassword))
            {
                _logger.LogWarning("CDN upload is enabled but credentials are not configured. CDN uploads will be skipped.");
                _enabled = false;
            }
        }
    }

    public async Task<bool> UploadFileAsync(string localFilePath, string remotePath)
    {
        if (!_enabled)
        {
            return true; // Return true to not break the flow when CDN is disabled
        }

        if (!File.Exists(localFilePath))
        {
            _logger.LogError("Local file does not exist: {LocalFilePath}", localFilePath);
            return false;
        }

        try
        {
            // Normalize remote path
            remotePath = remotePath.TrimStart('/');
            string fullRemotePath = string.IsNullOrWhiteSpace(_cdnBasePath) || _cdnBasePath == "/"
                ? remotePath
                : $"{_cdnBasePath.TrimEnd('/')}/{remotePath}";


            if (_useSftp)
            {
                return await UploadViaSftpAsync(localFilePath, fullRemotePath);
            }
            else
            {
                return await UploadViaFtpAsync(localFilePath, fullRemotePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to CDN. Local: {LocalFilePath}, Remote: {RemotePath}",
                localFilePath, remotePath);
            return false;
        }
    }

    private async Task<bool> UploadViaFtpAsync(string localFilePath, string remotePath)
    {
        try
        {
            // Create FTP request
            string ftpUrl = $"ftp://{_cdnHost}:{_cdnPort}/{remotePath}";
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
            request.Method = WebRequestMethods.Ftp.UploadFile;
            request.Credentials = new NetworkCredential(_cdnUsername, _cdnPassword);
            request.UseBinary = true;
            request.UsePassive = true;

            // Read file and upload
            byte[] fileContents = await File.ReadAllBytesAsync(localFilePath);
            request.ContentLength = fileContents.Length;

            using (Stream requestStream = await request.GetRequestStreamAsync())
            {
                await requestStream.WriteAsync(fileContents, 0, fileContents.Length);
            }

            // Get response
            using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
            {
                return response.StatusCode == FtpStatusCode.CommandOK || 
                       response.StatusCode == FtpStatusCode.ClosingData;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FTP upload failed. Remote: {RemotePath}", remotePath);
            throw;
        }
    }

    private async Task<bool> UploadViaSftpAsync(string localFilePath, string remotePath)
    {
        SftpClient? sftpClient = null;
        try
        {
            sftpClient = await CreateSftpClientAsync();

            // Ensure remote directory exists (including BasePath)
            string remoteDirectory = Path.GetDirectoryName(remotePath)?.Replace('\\', '/') ?? "/";
            if (!string.IsNullOrEmpty(remoteDirectory) && remoteDirectory != "/")
            {
                await Task.Run(() =>
                {
                    // Split the full path including BasePath
                    string[] directories = remoteDirectory.TrimStart('/').Split('/', StringSplitOptions.RemoveEmptyEntries);
                    string currentPath = "/";
                    
                    foreach (string dir in directories)
                    {
                        if (!string.IsNullOrEmpty(dir))
                        {
                            currentPath = currentPath.TrimEnd('/') + "/" + dir;
                            if (!sftpClient.Exists(currentPath))
                            {
                                sftpClient.CreateDirectory(currentPath);
                            }
                        }
                    }
                });
            }

            // Upload file
            using (var fileStream = new FileStream(localFilePath, FileMode.Open, FileAccess.Read))
            {
                await Task.Run(() => sftpClient.UploadFile(fileStream, remotePath));
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SFTP upload failed: {RemotePath}", remotePath);
            return false;
        }
        finally
        {
            await DisposeSftpClientAsync(sftpClient);
        }
    }

    public async Task<bool> DeleteFileAsync(string remotePath)
    {
        if (!_enabled)
        {
            return true;
        }

        try
        {
            remotePath = remotePath.TrimStart('/');
            string fullRemotePath = string.IsNullOrWhiteSpace(_cdnBasePath) || _cdnBasePath == "/"
                ? remotePath
                : $"{_cdnBasePath.TrimEnd('/')}/{remotePath}";

            if (_useSftp)
            {
                return await DeleteViaSftpAsync(fullRemotePath);
            }

            // Create FTP request for deletion
            string ftpUrl = $"ftp://{_cdnHost}:{_cdnPort}/{fullRemotePath}";
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
            request.Method = WebRequestMethods.Ftp.DeleteFile;
            request.Credentials = new NetworkCredential(_cdnUsername, _cdnPassword);

            using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
            {
                return response.StatusCode == FtpStatusCode.FileActionOK;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from CDN. Remote: {RemotePath}", remotePath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(string remotePath)
    {
        if (!_enabled)
        {
            return false;
        }

        try
        {
            remotePath = remotePath.TrimStart('/');
            string fullRemotePath = string.IsNullOrWhiteSpace(_cdnBasePath) || _cdnBasePath == "/"
                ? remotePath
                : $"{_cdnBasePath.TrimEnd('/')}/{remotePath}";

            if (_useSftp)
            {
                return await FileExistsViaSftpAsync(fullRemotePath);
            }

            // Create FTP request to check file size (if file exists, size will be returned)
            string ftpUrl = $"ftp://{_cdnHost}:{_cdnPort}/{fullRemotePath}";
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpUrl);
            request.Method = WebRequestMethods.Ftp.GetFileSize;
            request.Credentials = new NetworkCredential(_cdnUsername, _cdnPassword);

            try
            {
                using (FtpWebResponse response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    return true;
                }
            }
            catch (WebException ex) when (ex.Response is FtpWebResponse ftpResponse)
            {
                if (ftpResponse.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                {
                    return false;
                }
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file existence on CDN. Remote: {RemotePath}", remotePath);
            return false;
        }
    }

    private async Task<bool> DeleteViaSftpAsync(string remotePath)
    {
        SftpClient? sftpClient = null;
        try
        {
            sftpClient = await CreateSftpClientAsync();

            bool deleted = await Task.Run(() =>
            {
                if (sftpClient.Exists(remotePath))
                {
                    sftpClient.DeleteFile(remotePath);
                    return true;
                }
                return false;
            });

            return deleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SFTP delete failed: {RemotePath}", remotePath);
            return false;
        }
        finally
        {
            await DisposeSftpClientAsync(sftpClient);
        }
    }

    private async Task<bool> FileExistsViaSftpAsync(string remotePath)
    {
        SftpClient? sftpClient = null;
        try
        {
            sftpClient = await CreateSftpClientAsync();
            bool exists = await Task.Run(() => sftpClient.Exists(remotePath));
            return exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SFTP file existence check failed: {RemotePath}", remotePath);
            return false;
        }
        finally
        {
            await DisposeSftpClientAsync(sftpClient);
        }
    }

    private async Task<SftpClient> CreateSftpClientAsync()
    {
        var connectionInfo = new SshConnectionInfo(
            _cdnHost,
            _cdnPort,
            _cdnUsername,
            new PasswordAuthenticationMethod(_cdnUsername, _cdnPassword)
        );

        var sftpClient = new SftpClient(connectionInfo);
        await Task.Run(() => sftpClient.Connect());
        return sftpClient;
    }

    private async Task DisposeSftpClientAsync(SftpClient? sftpClient)
    {
        if (sftpClient != null && sftpClient.IsConnected)
        {
            await Task.Run(() => sftpClient.Disconnect());
            sftpClient.Dispose();
        }
    }

    public async Task<bool> DeleteDirectoryAsync(string remotePath)
    {
        if (!_enabled)
        {
            return true;
        }

        try
        {
            remotePath = remotePath.TrimStart('/');
            string fullRemotePath = string.IsNullOrWhiteSpace(_cdnBasePath) || _cdnBasePath == "/"
                ? remotePath
                : $"{_cdnBasePath.TrimEnd('/')}/{remotePath}";

            if (_useSftp)
            {
                return await DeleteDirectoryViaSftpAsync(fullRemotePath);
            }

            // FTP doesn't support recursive directory deletion easily
            // We'll just log a warning
            _logger.LogWarning("FTP directory deletion not implemented. Path: {RemotePath}", fullRemotePath);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting directory from CDN. Remote: {RemotePath}", remotePath);
            return false;
        }
    }

    private async Task<bool> DeleteDirectoryViaSftpAsync(string remotePath)
    {
        SftpClient? sftpClient = null;
        try
        {
            sftpClient = await CreateSftpClientAsync();

            bool deleted = await Task.Run(() =>
            {
                if (sftpClient.Exists(remotePath))
                {
                    // Delete all files and subdirectories recursively
                    DeleteDirectoryRecursive(sftpClient, remotePath);
                    // Delete the main directory itself
                    sftpClient.DeleteDirectory(remotePath);
                    return true;
                }
                return false;
            });

            return deleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SFTP directory deletion failed: {RemotePath}. Exception: {ExceptionMessage}", remotePath, ex.Message);
            return false;
        }
        finally
        {
            await DisposeSftpClientAsync(sftpClient);
        }
    }

    private void DeleteDirectoryRecursive(SftpClient sftpClient, string remotePath)
    {
        var files = sftpClient.ListDirectory(remotePath);
        foreach (var file in files)
        {
            if (file.Name == "." || file.Name == "..")
                continue;

            string fullPath = $"{remotePath.TrimEnd('/')}/{file.Name}";

            if (file.IsDirectory)
            {
                DeleteDirectoryRecursive(sftpClient, fullPath);
                sftpClient.DeleteDirectory(fullPath);
            }
            else
            {
                sftpClient.DeleteFile(fullPath);
            }
        }
    }
}

