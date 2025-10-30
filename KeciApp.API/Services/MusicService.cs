using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class MusicService : IMusicService
{
    private readonly IMusicRepository _musicRepository;
    private readonly IMapper _mapper;

    public MusicService(IMusicRepository musicRepository, IMapper mapper)
    {
        _musicRepository = musicRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<MusicResponseDTO>> GetAllMusicAsync()
    {
        var music = await _musicRepository.GetAllMusicAsync();
        return _mapper.Map<IEnumerable<MusicResponseDTO>>(music);
    }

    public async Task<MusicResponseDTO> GetMusicByIdAsync(int musicId)
    {
        var music = await _musicRepository.GetMusicByIdAsync(musicId);
        if (music == null)
        {
            throw new InvalidOperationException("Music not found");
        }

        return _mapper.Map<MusicResponseDTO>(music);
    }

    public async Task<MusicResponseDTO> AddMusicAsync(CreateMusicRequest request)
    {
        var maxOrder = await _musicRepository.GetMaxMusicOrderAsync();
        var music = _mapper.Map<Music>(request);
        music.order = maxOrder + 1;
        var createdMusic = await _musicRepository.CreateMusicAsync(music);
        return _mapper.Map<MusicResponseDTO>(createdMusic);
    }

    public async Task<MusicResponseDTO> EditMusicAsync(EditMusicRequest request)
    {
        var music = await _musicRepository.GetMusicByIdAsync(request.MusicId);
        if (music == null)
        {
            throw new InvalidOperationException("Music not found");
        }

        _mapper.Map(request, music);
        var updatedMusic = await _musicRepository.UpdateMusicAsync(music);
        return _mapper.Map<MusicResponseDTO>(updatedMusic);
    }

    public async Task<MusicResponseDTO> DeleteMusicAsync(int musicId)
    {
        var music = await _musicRepository.GetMusicByIdAsync(musicId);
        if (music == null)
        {
            throw new InvalidOperationException("Music not found");
        }

        await _musicRepository.RemoveMusicAsync(music);
        return _mapper.Map<MusicResponseDTO>(music);
    }
}
