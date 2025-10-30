using KeciApp.API.Models;

namespace KeciApp.API.Interfaces
{
    public interface INotesRepository
    {
        Task<IEnumerable<Notes>> GetAllNotesAsync();
        Task<IEnumerable<Notes>> GetAllNotesByUserIdAsync(int userId);
        Task<IEnumerable<Notes>> GetAllNotesByEpisodeIdAsync(int episodeId);
        Task<Notes?> GetNoteAsync(int userId, int? episodeId);
        Task<Notes> AddNoteAsync(Notes note);
        Task<Notes> UpdateNoteAsync(Notes note);
        Task RemoveNoteAsync(Notes note);
    }
}
