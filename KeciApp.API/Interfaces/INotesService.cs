using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface INotesService
{
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesAsync();
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesByUserIdAsync(int userId);
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesByEpisodeIdAsync(int episodeId);
    Task<NoteResponseDTO?> GetNoteByUserIdAndEpisodeIdAsync(int userId, int episodeId);
    Task<NoteResponseDTO> AddNoteToPodcastEpisodeAsync(AddNoteRequest request);
    Task<NoteResponseDTO> EditNoteOfPodcastEpisodeAsync(EditNoteRequest request);
    Task<NoteResponseDTO> DeleteNoteOfPodcastEpisodeAsync(DeleteNoteRequest request);

}
