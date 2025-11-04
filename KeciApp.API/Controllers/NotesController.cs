using Microsoft.AspNetCore.Mvc;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Services;

namespace KeciApp.API.Controllers;
[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly INotesService _notesService;

    public NotesController(INotesService notesService)
    {
        _notesService = notesService;
    }

    [HttpGet("notes")]
    public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetAllNotes()
    {
        try
        {
            var notes = await _notesService.GetAllNotesAsync();
            return Ok(notes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("notes/user/{userId}")]
    public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetAllNotesByUserId(int userId)
    {
        try
        {
            var notes = await _notesService.GetAllNotesByUserIdAsync(userId);
            return Ok(notes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("notes/episode/{episodeId}")]
    public async Task<ActionResult<IEnumerable<NoteResponseDTO>>> GetAllNotesByEpisodeId(int episodeId)
    {
        try
        {
            var notes = await _notesService.GetAllNotesByEpisodeIdAsync(episodeId);
            return Ok(notes);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("notes/user/{userId}/episode/{episodeId}")]
    public async Task<ActionResult<NoteResponseDTO>> GetNoteByUserIdAndEpisodeId(int userId, int episodeId)
    {
        try
        {
            var note = await _notesService.GetNoteByUserIdAndEpisodeIdAsync(userId, episodeId);
            if (note == null)
            {
                return NotFound(new { message = "Note not found" });
            }
            return Ok(note);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("notes")]
    public async Task<ActionResult<NoteResponseDTO>> AddNoteToPodcastEpisode([FromBody] AddNoteRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var note = await _notesService.AddNoteToPodcastEpisodeAsync(request);
            return Ok(note);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("notes")]
    public async Task<ActionResult<NoteResponseDTO>> EditNoteOfPodcastEpisode([FromBody] EditNoteRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var note = await _notesService.EditNoteOfPodcastEpisodeAsync(request);
            return Ok(note);
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

    [HttpDelete("notes")]
    public async Task<ActionResult<NoteResponseDTO>> DeleteNoteOfPodcastEpisode([FromBody] DeleteNoteRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var note = await _notesService.DeleteNoteOfPodcastEpisodeAsync(request);
            return Ok(note);
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

}
