using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class MusicRepository : IMusicRepository
{
    private readonly AppDbContext _context;
    public MusicRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Music>> GetAllMusicAsync()
    {
        return await _context.Musics.ToListAsync();
    }
    public async Task<Music?> GetMusicByIdAsync(int musicId)
    {
        return await _context.Musics.FindAsync(musicId);
    }
    public async Task<int> GetMaxMusicOrderAsync()
    {
        return await _context.Musics.MaxAsync(m => m.order);
    }
    public async Task<int> GetMusicIdByOrderAsync(int order)
    {
        return await _context.Musics
            .Where(m => m.order == order)
            .Select(m => m.MusicId)
            .FirstOrDefaultAsync();
    }
    public async Task<Music> CreateMusicAsync(Music music)
    {
        _context.Musics.Add(music);
        await _context.SaveChangesAsync();
        return music;
    }
    public async Task<Music> UpdateMusicAsync(Music music)
    {
        _context.Musics.Update(music);
        await _context.SaveChangesAsync();
        return music;
    }
    public async Task RemoveMusicAsync(Music music)
    {
        _context.Musics.Remove(music);
        await _context.SaveChangesAsync();
    }
}
