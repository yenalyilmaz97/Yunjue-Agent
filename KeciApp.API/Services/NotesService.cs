
using AutoMapper;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;
public class NotesService : INotesService
{
    private readonly INotesRepository _notesRepository;
    private readonly IPodcastEpisodesRepository _episodesRepository;
    private readonly IMapper _mapper;

    public NotesService(INotesRepository notesRepository, IPodcastEpisodesRepository podcastEpisodesRepository, IMapper mapper)
    {
        _notesRepository = notesRepository;
        _episodesRepository = podcastEpisodesRepository;
        _mapper = mapper;
    }
    public async Task<IEnumerable<NoteResponseDTO>> GetAllNotesAsync()
    {
        var notes = await _notesRepository.GetAllNotesAsync();
        var responseDtos = _mapper.Map<IEnumerable<NoteResponseDTO>>(notes);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var note = notes.FirstOrDefault(n => n.NoteId == responseDto.NoteId);
            if (note?.PodcastEpisode != null)
            {
                responseDto.SeriesTitle = note.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = note.PodcastEpisode.Title;
            }
        }

        return responseDtos;
    }
    public async Task<IEnumerable<NoteResponseDTO>> GetAllNotesByUserIdAsync(int userId)
    {
        var notes = await _notesRepository.GetAllNotesByUserIdAsync(userId);
        var responseDtos = _mapper.Map<IEnumerable<NoteResponseDTO>>(notes);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var note = notes.FirstOrDefault(n => n.NoteId == responseDto.NoteId);
            if (note?.PodcastEpisode != null)
            {
                responseDto.SeriesTitle = note.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = note.PodcastEpisode.Title;
            }
        }

        return responseDtos;
    }
    public async Task<IEnumerable<NoteResponseDTO>> GetAllNotesByEpisodeIdAsync(int episodeId)
    {
        var notes = await _notesRepository.GetAllNotesByEpisodeIdAsync(episodeId);
        var responseDtos = _mapper.Map<IEnumerable<NoteResponseDTO>>(notes);

        // Set series and episode titles manually
        foreach (var responseDto in responseDtos)
        {
            var note = notes.FirstOrDefault(n => n.NoteId == responseDto.NoteId);
            if (note?.PodcastEpisode != null)
            {
                responseDto.SeriesTitle = note.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
                responseDto.EpisodeTitle = note.PodcastEpisode.Title;
            }
        }

        return responseDtos;
    }
    public async Task<NoteResponseDTO?> GetNoteByUserIdAndEpisodeIdAsync(int userId, int episodeId)
    {
        var note = await _notesRepository.GetNoteAsync(userId, episodeId);
        if (note == null)
        {
            return null;
        }

        var responseDto = _mapper.Map<NoteResponseDTO>(note);
        if (note.PodcastEpisode != null)
        {
            responseDto.SeriesTitle = note.PodcastEpisode.PodcastSeries?.Title ?? string.Empty;
            responseDto.EpisodeTitle = note.PodcastEpisode.Title;
        }

        return responseDto;
    }
    public async Task<NoteResponseDTO> AddNoteToPodcastEpisodeAsync(AddNoteRequest request)
    {
        // Get episode with series information for the note
        var episode = await _episodesRepository.GetPodcastEpisodeByIdAsync(request.EpisodeId);
        if (episode == null)
        {
            throw new InvalidOperationException("Episode not found");
        }

        var note = _mapper.Map<Notes>(request);
        note.Title = episode.Title; // Set the episode title
        note.CreatedAt = DateTime.UtcNow;
        note.UpdatedAt = DateTime.UtcNow;
        var addedNote = await _notesRepository.AddNoteAsync(note);

        // Map to response DTO with series information
        var responseDto = _mapper.Map<NoteResponseDTO>(addedNote);
        responseDto.SeriesTitle = episode.PodcastSeries?.Title ?? string.Empty;
        responseDto.EpisodeTitle = episode.Title;

        return responseDto;
    }
    public async Task<NoteResponseDTO> EditNoteOfPodcastEpisodeAsync(EditNoteRequest request)
    {
        var noteEntity = await _notesRepository.GetNoteAsync(request.UserId, request.EpisodeId);
        if (noteEntity == null)
        {
            throw new InvalidOperationException("Note not found");
        }

        noteEntity.NoteText = request.NoteText;
        var updatedNote = await _notesRepository.UpdateNoteAsync(noteEntity);
        return _mapper.Map<NoteResponseDTO>(updatedNote);
    }
    public async Task<NoteResponseDTO> DeleteNoteOfPodcastEpisodeAsync(DeleteNoteRequest request)
    {
        var note = await _notesRepository.GetNoteAsync(request.UserId, request.EpisodeId);
        if (note == null)
        {
            throw new InvalidOperationException("Note not found");
        }

        await _notesRepository.RemoveNoteAsync(note);
        return _mapper.Map<NoteResponseDTO>(note);
    }
}
