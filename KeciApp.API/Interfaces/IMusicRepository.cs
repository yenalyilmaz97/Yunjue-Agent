using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IMusicRepository
{
    Task<IEnumerable<Music>> GetAllMusicAsync();
    Task<Music?> GetMusicByIdAsync(int musicId);
    Task<Music> CreateMusicAsync(Music music);
    Task<Music> UpdateMusicAsync(Music music);
    Task RemoveMusicAsync(Music music);
    Task<int> GetMaxMusicOrderAsync();
    Task<int> GetMusicIdByOrderAsync(int order);
}
