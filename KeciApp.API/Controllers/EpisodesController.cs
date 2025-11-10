using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;
using KeciApp.API.Models;
using System.Text.Json;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class EpisodesController : ControllerBase
{
    private readonly IPodcastEpisodesService _episodeService;
    private readonly IPodcastSeriesRepository _seriesRepository;
    private readonly IPodcastEpisodesRepository _episodesRepository;
    private readonly IFileUploadService _fileUploadService;

    public EpisodesController(
        IPodcastEpisodesService episodeService,
        IPodcastSeriesRepository seriesRepository,
        IPodcastEpisodesRepository episodesRepository,
        IFileUploadService fileUploadService)
    {
        _episodeService = episodeService;
        _seriesRepository = seriesRepository;
        _episodesRepository = episodesRepository;
        _fileUploadService = fileUploadService;
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
            // Get series information for file upload
            var series = await _seriesRepository.GetPodcastSeriesByIdAsync(request.SeriesId);
            if (series == null)
            {
                return BadRequest(new { message = "Series not found" });
            }

            var content = new EpisodeContent();

            // Get max sequence number for this series (for file naming)
            var maxSeq = await _episodesRepository.GetMaxEpisodeSequenceAsync(request.SeriesId);
            int baseSequenceNumber = maxSeq + 1;
            int currentSequenceNumber = baseSequenceNumber;

            // Upload audio file if provided
            if (request.AudioFile != null && request.AudioFile.Length > 0)
            {

                string audioUrl = await _fileUploadService.UploadFileAsync(
                    request.AudioFile,
                    "podcast-episode",
                    series.Title,
                    request.Title,
                    currentSequenceNumber++
                );
                content.Audio = audioUrl;
            }
            else if (!string.IsNullOrWhiteSpace(request.AudioUrl))
            {
                content.Audio = request.AudioUrl;
            }

            // Upload video file if provided
            if (request.VideoFile != null && request.VideoFile.Length > 0)
            {
                string videoUrl = await _fileUploadService.UploadFileAsync(
                    request.VideoFile,
                    "podcast-episode",
                    series.Title,
                    request.Title,
                    currentSequenceNumber++
                );
                content.Video = videoUrl;
            }
            else if (!string.IsNullOrWhiteSpace(request.VideoUrl))
            {
                content.Video = request.VideoUrl;
            }

            // Upload image files if provided
            if (request.ImageFiles != null && request.ImageFiles.Count > 0)
            {
                var imageUrls = new List<string>();
                for (int i = 0; i < request.ImageFiles.Count; i++)
                {
                    var imageFile = request.ImageFiles[i];
                    if (imageFile != null && imageFile.Length > 0)
                    {
                        string imageUrl = await _fileUploadService.UploadFileAsync(
                            imageFile,
                            "podcast-episode",
                            series.Title,
                            request.Title,
                            currentSequenceNumber++
                        );
                        imageUrls.Add(imageUrl);
                    }
                }
                if (imageUrls.Count > 0)
                {
                    content.Images = imageUrls;
                }
            }
            else if (request.ImageUrls != null && request.ImageUrls.Count > 0)
            {
                content.Images = request.ImageUrls;
            }
            else if (!string.IsNullOrWhiteSpace(request.ImageUrlsJson))
            {
                try
                {
                    var imageUrlList = JsonSerializer.Deserialize<List<string>>(request.ImageUrlsJson);
                    if (imageUrlList != null && imageUrlList.Count > 0)
                    {
                        content.Images = imageUrlList;
                    }
                }
                catch
                {
                    // Ignore JSON parse errors
                }
            }

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
            return Ok(episode);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
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
