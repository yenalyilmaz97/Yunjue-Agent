using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;
using KeciApp.API.Models;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EpisodesController : ControllerBase
{
    private readonly IPodcastEpisodesService _episodeService;
    private readonly IPodcastSeriesRepository _seriesRepository;
    private readonly IPodcastEpisodesRepository _episodesRepository;
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<EpisodesController> _logger;

    public EpisodesController(
        IPodcastEpisodesService episodeService,
        IPodcastSeriesRepository seriesRepository,
        IPodcastEpisodesRepository episodesRepository,
        IFileUploadService fileUploadService,
        ILogger<EpisodesController> logger)
    {
        _episodeService = episodeService;
        _seriesRepository = seriesRepository;
        _episodesRepository = episodesRepository;
        _fileUploadService = fileUploadService;
        _logger = logger;
    }

    [HttpGet("episodes/{episodeId}")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> GetPodcastEpisodeById(int episodeId)
    {
        try
        {
            var episode = await _episodeService.GetPodcastEpisodeByIdAsync(episodeId);
            if (episode == null)
            {
                return NotFound(new { message = "Episode not found" });
            }
            return Ok(episode);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("series/{seriesId}/episodes")]
    public async Task<ActionResult<IEnumerable<PodcastEpisodeResponseDTO>>> GetAllPodcastEpisodesBySeriesId(int seriesId)
    {
        try
        {
            var episodes = await _episodeService.GetAllPodcastEpisodesBySeriesIdAsync(seriesId);
            return Ok(episodes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("episodes")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> CreateNewPodcastEpisode([FromForm] CreatePodcastEpisodeWithFilesRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new podcast episode. SeriesId: {SeriesId}, Title: {Title}", request.SeriesId, request.Title);
            _logger.LogInformation("Files received - AudioFile: {HasAudio}, VideoFile: {HasVideo}, ImageFiles: {ImageCount}", 
                request.AudioFile != null, request.VideoFile != null, request.ImageFiles?.Count ?? 0);

            // Get series information for file upload
            var series = await _seriesRepository.GetPodcastSeriesByIdAsync(request.SeriesId);
            if (series == null)
            {
                _logger.LogWarning("Series not found. SeriesId: {SeriesId}", request.SeriesId);
                return BadRequest(new { message = "Series not found" });
            }

            _logger.LogInformation("Series found. Title: {SeriesTitle}", series.Title);

            var content = new EpisodeContent();

            // Get max sequence number for this series (for file naming)
            var maxSeq = await _episodesRepository.GetMaxEpisodeSequenceAsync(request.SeriesId);
            int baseSequenceNumber = maxSeq + 1;
            int currentSequenceNumber = baseSequenceNumber;

            _logger.LogInformation("Starting sequence number: {SequenceNumber}", baseSequenceNumber);

            // Upload audio file if provided
            if (request.AudioFile != null && request.AudioFile.Length > 0)
            {
                _logger.LogInformation("Uploading audio file. FileName: {FileName}, Size: {Size} bytes", 
                    request.AudioFile.FileName, request.AudioFile.Length);
                
                try
                {
                    string audioUrl = await _fileUploadService.UploadFileAsync(
                        request.AudioFile,
                        "podcast-episode",
                        series.Title,
                        request.Title,
                        currentSequenceNumber++
                    );
                    content.Audio = audioUrl;
                    _logger.LogInformation("Audio file uploaded successfully. URL: {AudioUrl}", audioUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading audio file");
                    return BadRequest(new { message = $"Error uploading audio file: {ex.Message}" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.AudioUrl))
            {
                content.Audio = request.AudioUrl;
                _logger.LogInformation("Using provided audio URL: {AudioUrl}", request.AudioUrl);
            }

            // Upload video file if provided
            if (request.VideoFile != null && request.VideoFile.Length > 0)
            {
                _logger.LogInformation("Uploading video file. FileName: {FileName}, Size: {Size} bytes", 
                    request.VideoFile.FileName, request.VideoFile.Length);
                
                try
                {
                    string videoUrl = await _fileUploadService.UploadFileAsync(
                        request.VideoFile,
                        "podcast-episode",
                        series.Title,
                        request.Title,
                        currentSequenceNumber++
                    );
                    content.Video = videoUrl;
                    _logger.LogInformation("Video file uploaded successfully. URL: {VideoUrl}", videoUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading video file");
                    return BadRequest(new { message = $"Error uploading video file: {ex.Message}" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.VideoUrl))
            {
                content.Video = request.VideoUrl;
                _logger.LogInformation("Using provided video URL: {VideoUrl}", request.VideoUrl);
            }

            // Upload image files if provided
            if (request.ImageFiles != null && request.ImageFiles.Count > 0)
            {
                _logger.LogInformation("Uploading {Count} image files", request.ImageFiles.Count);
                var imageUrls = new List<string>();
                for (int i = 0; i < request.ImageFiles.Count; i++)
                {
                    var imageFile = request.ImageFiles[i];
                    if (imageFile != null && imageFile.Length > 0)
                    {
                        _logger.LogInformation("Uploading image file {Index}. FileName: {FileName}, Size: {Size} bytes", 
                            i + 1, imageFile.FileName, imageFile.Length);
                        
                        try
                        {
                            string imageUrl = await _fileUploadService.UploadFileAsync(
                                imageFile,
                                "podcast-episode",
                                series.Title,
                                request.Title,
                                currentSequenceNumber++
                            );
                            imageUrls.Add(imageUrl);
                            _logger.LogInformation("Image file {Index} uploaded successfully. URL: {ImageUrl}", i + 1, imageUrl);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error uploading image file {Index}", i + 1);
                            return BadRequest(new { message = $"Error uploading image file {i + 1}: {ex.Message}" });
                        }
                    }
                }
                if (imageUrls.Count > 0)
                {
                    content.Images = imageUrls;
                    _logger.LogInformation("All {Count} image files uploaded successfully", imageUrls.Count);
                }
            }
            else if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                content.Images = request.ImageUrls;
                _logger.LogInformation("Using provided image URLs. Count: {Count}", request.ImageUrls.Count);
            }
            else if (!string.IsNullOrWhiteSpace(request.ImageUrlsJson))
            {
                try
                {
                    var imageUrlList = JsonSerializer.Deserialize<List<string>>(request.ImageUrlsJson);
                    if (imageUrlList != null && imageUrlList.Count > 0)
                    {
                        content.Images = imageUrlList;
                        _logger.LogInformation("Using image URLs from JSON. Count: {Count}", imageUrlList.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse ImageUrlsJson");
                    // Ignore JSON parse errors
                }
            }

            _logger.LogInformation("Content prepared - Audio: {HasAudio}, Video: {HasVideo}, Images: {ImageCount}", 
                !string.IsNullOrWhiteSpace(content.Audio), !string.IsNullOrWhiteSpace(content.Video), content.Images?.Count ?? 0);

            // Create the episode request
            var createRequest = new CreatePodcastEpisodeRequest
            {
                SeriesId = request.SeriesId,
                Title = request.Title,
                Description = request.Description,
                Content = content,
                IsActive = request.IsActive,
                IsVideo = request.IsVideo
            };

            var episode = await _episodeService.CreatePodcastEpisodeAsync(createRequest);
            _logger.LogInformation("Episode created successfully. EpisodeId: {EpisodeId}", episode.EpisodesId);
            
            return Ok(episode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating podcast episode");
            return BadRequest(new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpPut("episodes")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> UpdatePodcastEpisode([FromBody] EditPodcastEpisodeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var episode = await _episodeService.UpdatePodcastEpisodeAsync(request);
            return Ok(episode);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("episodes/with-files")]
    public async Task<ActionResult<PodcastEpisodeResponseDTO>> UpdatePodcastEpisodeWithFiles([FromForm] EditPodcastEpisodeWithFilesRequest request)
    {
        try
        {
            _logger.LogInformation("Updating podcast episode. EpisodeId: {EpisodeId}, SeriesId: {SeriesId}, Title: {Title}", 
                request.EpisodeId, request.SeriesId, request.Title);
            _logger.LogInformation("Files received - AudioFile: {HasAudio}, VideoFile: {HasVideo}, ImageFiles: {ImageCount}", 
                request.AudioFile != null, request.VideoFile != null, request.ImageFiles?.Count ?? 0);

            // Get existing episode to preserve content if files are not provided
            var existingEpisode = await _episodesRepository.GetPodcastEpisodeByIdAsync(request.EpisodeId);
            if (existingEpisode == null)
            {
                _logger.LogWarning("Episode not found. EpisodeId: {EpisodeId}", request.EpisodeId);
                return NotFound(new { message = "Episode not found" });
            }

            // Get series information for file upload
            var series = await _seriesRepository.GetPodcastSeriesByIdAsync(request.SeriesId);
            if (series == null)
            {
                _logger.LogWarning("Series not found. SeriesId: {SeriesId}", request.SeriesId);
                return BadRequest(new { message = "Series not found" });
            }

            _logger.LogInformation("Series found. Title: {SeriesTitle}", series.Title);

            // Deserialize existing content
            EpisodeContent? existingContent = null;
            if (!string.IsNullOrWhiteSpace(existingEpisode.ContentJson))
            {
                try
                {
                    existingContent = JsonSerializer.Deserialize<EpisodeContent>(existingEpisode.ContentJson);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to deserialize existing content");
                }
            }

            // Start with existing content or create new
            var content = existingContent ?? new EpisodeContent();

            // Use existing episode's sequence number for file naming
            int currentSequenceNumber = existingEpisode.SequenceNumber;

            // Upload audio file if provided (replaces existing)
            if (request.AudioFile != null && request.AudioFile.Length > 0)
            {
                _logger.LogInformation("Uploading new audio file. FileName: {FileName}, Size: {Size} bytes", 
                    request.AudioFile.FileName, request.AudioFile.Length);
                
                try
                {
                    string audioUrl = await _fileUploadService.UploadFileAsync(
                        request.AudioFile,
                        "podcast-episode",
                        series.Title,
                        request.Title,
                        currentSequenceNumber++
                    );
                    content.Audio = audioUrl;
                    _logger.LogInformation("Audio file uploaded successfully. URL: {AudioUrl}", audioUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading audio file");
                    return BadRequest(new { message = $"Error uploading audio file: {ex.Message}" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.AudioUrl))
            {
                content.Audio = request.AudioUrl;
                _logger.LogInformation("Using provided audio URL: {AudioUrl}", request.AudioUrl);
            }
            // If no new audio file and no URL provided, keep existing audio

            // Upload video file if provided (replaces existing)
            if (request.VideoFile != null && request.VideoFile.Length > 0)
            {
                _logger.LogInformation("Uploading new video file. FileName: {FileName}, Size: {Size} bytes", 
                    request.VideoFile.FileName, request.VideoFile.Length);
                
                try
                {
                    string videoUrl = await _fileUploadService.UploadFileAsync(
                        request.VideoFile,
                        "podcast-episode",
                        series.Title,
                        request.Title,
                        currentSequenceNumber++
                    );
                    content.Video = videoUrl;
                    _logger.LogInformation("Video file uploaded successfully. URL: {VideoUrl}", videoUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading video file");
                    return BadRequest(new { message = $"Error uploading video file: {ex.Message}" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.VideoUrl))
            {
                content.Video = request.VideoUrl;
                _logger.LogInformation("Using provided video URL: {VideoUrl}", request.VideoUrl);
            }
            // If no new video file and no URL provided, keep existing video

            // Upload image files if provided (replaces existing)
            if (request.ImageFiles != null && request.ImageFiles.Count > 0)
            {
                _logger.LogInformation("Uploading {Count} new image files", request.ImageFiles.Count);
                var imageUrls = new List<string>();
                for (int i = 0; i < request.ImageFiles.Count; i++)
                {
                    var imageFile = request.ImageFiles[i];
                    if (imageFile != null && imageFile.Length > 0)
                    {
                        _logger.LogInformation("Uploading image file {Index}. FileName: {FileName}, Size: {Size} bytes", 
                            i + 1, imageFile.FileName, imageFile.Length);
                        
                        try
                        {
                            string imageUrl = await _fileUploadService.UploadFileAsync(
                                imageFile,
                                "podcast-episode",
                                series.Title,
                                request.Title,
                                currentSequenceNumber++
                            );
                            imageUrls.Add(imageUrl);
                            _logger.LogInformation("Image file {Index} uploaded successfully. URL: {ImageUrl}", i + 1, imageUrl);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error uploading image file {Index}", i + 1);
                            return BadRequest(new { message = $"Error uploading image file {i + 1}: {ex.Message}" });
                        }
                    }
                }
                if (imageUrls.Count > 0)
                {
                    content.Images = imageUrls;
                    _logger.LogInformation("All {Count} image files uploaded successfully", imageUrls.Count);
                }
            }
            else if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                content.Images = request.ImageUrls;
                _logger.LogInformation("Using provided image URLs. Count: {Count}", request.ImageUrls.Count);
            }
            else if (!string.IsNullOrWhiteSpace(request.ImageUrlsJson))
            {
                try
                {
                    var imageUrlList = JsonSerializer.Deserialize<List<string>>(request.ImageUrlsJson);
                    if (imageUrlList != null && imageUrlList.Count > 0)
                    {
                        content.Images = imageUrlList;
                        _logger.LogInformation("Using image URLs from JSON. Count: {Count}", imageUrlList.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse ImageUrlsJson");
                    // Ignore JSON parse errors
                }
            }
            // If no new image files and no URLs provided, keep existing images

            _logger.LogInformation("Content prepared - Audio: {HasAudio}, Video: {HasVideo}, Images: {ImageCount}", 
                !string.IsNullOrWhiteSpace(content.Audio), !string.IsNullOrWhiteSpace(content.Video), content.Images?.Count ?? 0);

            // Create the update request
            var updateRequest = new EditPodcastEpisodeRequest
            {
                EpisodeId = request.EpisodeId,
                SeriesId = request.SeriesId,
                Title = request.Title,
                Description = request.Description,
                Content = content,
                SequenceNumber = request.SequenceNumber,
                IsActive = request.IsActive,
                IsVideo = request.IsVideo ?? existingEpisode.isVideo
            };

            var episode = await _episodeService.UpdatePodcastEpisodeAsync(updateRequest);
            _logger.LogInformation("Episode updated successfully. EpisodeId: {EpisodeId}", episode.EpisodesId);
            
            return Ok(episode);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "Invalid operation while updating episode");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating podcast episode");
            return BadRequest(new { message = ex.Message, details = ex.ToString() });
        }
    }

    [HttpDelete("episodes/{episodeId}")]
    public async Task<ActionResult> DeletePodcastEpisode(int episodeId)
    {
        try
        {
            await _episodeService.RemovePodcastEpisodeAsync(episodeId);
            return Ok(new { message = "Podcast episode deleted successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("episodes/eligible/{userId}")]
    public async Task<ActionResult<IEnumerable<PodcastEpisodeResponseDTO>>> GetEligiblePodcastEpisodesByUserId(int userId)
    {
        try
        {
            var episodes = await _episodeService.GetEligiblePodcastEpisodesByUserIdAsync(userId);
            return Ok(episodes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
