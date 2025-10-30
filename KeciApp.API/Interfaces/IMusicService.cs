using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IMusicService
{
    Task<IEnumerable<MusicResponseDTO>> GetAllMusicAsync();
    Task<MusicResponseDTO> GetMusicByIdAsync(int musicId);
    Task<MusicResponseDTO> AddMusicAsync(CreateMusicRequest request);
    Task<MusicResponseDTO> EditMusicAsync(EditMusicRequest request);
    Task<MusicResponseDTO> DeleteMusicAsync(int musicId);
}
