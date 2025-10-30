using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;
public class NotesRepository : INotesRepository
{
    private readonly AppDbContext _context;

    public NotesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notes>> GetAllNotesAsync()
    {
        return await _context.Notes
            .Include(n => n.PodcastEpisode)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(n => n.User)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notes>> GetAllNotesByUserIdAsync(int userId)
    {
        return await _context.Notes
            .Where(n => n.UserId == userId)
            .Include(n => n.PodcastEpisode)
                .ThenInclude(ep => ep.PodcastSeries)
            .Include(n => n.User)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Notes>> GetAllNotesByEpisodeIdAsync(int episodeId)
    {
        return await _context.Notes
            .Where(n => n.EpisodeId == episodeId)
            .Include(n => n.PodcastEpisode)
            .Include(n => n.User)
            .OrderByDescending(n => n.UpdatedAt)
            .ToListAsync();
    }

    public async Task<Notes?> GetNoteAsync(int userId, int? episodeId)
    {
        return await _context.Notes
            .Include(n => n.PodcastEpisode)
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.UserId == userId && n.EpisodeId == episodeId);
    }

    public async Task<Notes> AddNoteAsync(Notes note)
    {
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;

        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        return await _context.Notes
            .Include(n => n.PodcastEpisode)
            .Include(n => n.User)
            .FirstAsync(n => n.NoteId == note.NoteId);
    }

    public async Task<Notes> UpdateNoteAsync(Notes note)
    {
        note.UpdatedAt = DateTime.UtcNow;

        _context.Notes.Update(note);
        await _context.SaveChangesAsync();

        return await _context.Notes
            .Include(n => n.PodcastEpisode)
            .Include(n => n.User)
            .FirstAsync(n => n.NoteId == note.NoteId);
    }

    public async Task RemoveNoteAsync(Notes note)
    {
        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();
    }

}
