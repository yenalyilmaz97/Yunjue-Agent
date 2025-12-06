using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface INotesService
{
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesAsync();
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesByUserIdAsync(int userId);
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesByEpisodeIdAsync(int episodeId);
    Task<IEnumerable<NoteResponseDTO>> GetAllNotesByArticleIdAsync(int articleId);
    Task<NoteResponseDTO?> GetNoteByUserIdAndEpisodeIdAsync(int userId, int episodeId);
    Task<NoteResponseDTO?> GetNoteByUserIdAndArticleIdAsync(int userId, int articleId);
    Task<NoteResponseDTO> AddNoteAsync(AddNoteRequest request);
    Task<NoteResponseDTO> AddNoteToPodcastEpisodeAsync(AddNoteRequest request);
    Task<NoteResponseDTO> EditNoteAsync(EditNoteRequest request);
    Task<NoteResponseDTO> EditNoteOfPodcastEpisodeAsync(EditNoteRequest request);
    Task<NoteResponseDTO> DeleteNoteOfPodcastEpisodeAsync(DeleteNoteRequest request);

}
