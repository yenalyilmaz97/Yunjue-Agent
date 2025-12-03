using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Repositories;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class UserSeriesAccessService : IUserSeriesAccessService
{
    private readonly IUserSeriesAccessRepository _userSeriesAccessRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPodcastSeriesRepository _podcastSeriesRepository;
    private readonly IUserProgressRepository _userProgressRepository;
    private readonly IPodcastEpisodesRepository _podcastEpisodesRepository;
    private readonly IMapper _mapper;

    public UserSeriesAccessService(
        IUserSeriesAccessRepository userSeriesAccessRepository, 
        IUserRepository userRepository,
        IPodcastSeriesRepository podcastSeriesRepository,
        IUserProgressRepository userProgressRepository,
        IPodcastEpisodesRepository podcastEpisodesRepository,
        IMapper mapper)
    {
        _userSeriesAccessRepository = userSeriesAccessRepository;
        _userRepository = userRepository;
        _podcastSeriesRepository = podcastSeriesRepository;
        _userProgressRepository = userProgressRepository;
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserSeriesAccessResponseDTO>> GetAllUserSeriesAccessAsync()
    {
        var accessRecords = await _userSeriesAccessRepository.GetAllUserSeriesAccessAsync();
        return _mapper.Map<IEnumerable<UserSeriesAccessResponseDTO>>(accessRecords);
    }

    public async Task<UserSeriesAccessResponseDTO> GetUserSeriesAccessByIdAsync(int id)
    {
        var access = await _userSeriesAccessRepository.GetUserSeriesAccessByIdAsync(id);
        if (access == null)
        {
            throw new InvalidOperationException("User series access not found");
        }
        return _mapper.Map<UserSeriesAccessResponseDTO>(access);
    }

    public async Task<IEnumerable<UserSeriesAccessResponseDTO>> GetUserSeriesAccessByUserIdAsync(int userId)
    {
        var accessRecords = await _userSeriesAccessRepository.GetUserSeriesAccessByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<UserSeriesAccessResponseDTO>>(accessRecords);
    }

    public async Task<UserSeriesAccessResponseDTO> GetUserSeriesAccessByUserIdAndSeriesIdAsync(int userId, int seriesId)
    {
        var access = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, seriesId);
        if (access == null)
        {
            throw new InvalidOperationException("User series access not found");
        }
        return _mapper.Map<UserSeriesAccessResponseDTO>(access);
    }

    public async Task<UserSeriesAccessResponseDTO> CreateUserSeriesAccessAsync(CreateUserSeriesAccessRequest request)
    {
        var access = _mapper.Map<UserSeriesAccess>(request);
        var createdAccess = await _userSeriesAccessRepository.CreateUserSeriesAccessAsync(access);
        return _mapper.Map<UserSeriesAccessResponseDTO>(createdAccess);
    }

    public async Task<UserSeriesAccessResponseDTO> UpdateUserSeriesAccessAsync(int id, UpdateUserSeriesAccessRequest request)
    {
        var existingAccess = await _userSeriesAccessRepository.GetUserSeriesAccessByIdAsync(id);
        if (existingAccess == null)
        {
            throw new InvalidOperationException("User series access not found");
        }

        existingAccess.CurrentAccessibleSequence = request.CurrentAccessibleSequence;

        var updatedAccess = await _userSeriesAccessRepository.UpdateUserSeriesAccessAsync(existingAccess);
        return _mapper.Map<UserSeriesAccessResponseDTO>(updatedAccess);
    }

    public async Task DeleteUserSeriesAccessAsync(int id)
    {
        var access = await _userSeriesAccessRepository.GetUserSeriesAccessByIdAsync(id);
        if (access == null)
        {
            throw new InvalidOperationException("User series access not found");
        }

        await _userSeriesAccessRepository.DeleteUserSeriesAccessAsync(id);
    }

    public async Task<UserSeriesAccessStatsDTO> GetUserSeriesAccessStatsAsync()
    {
        var accessRecords = await _userSeriesAccessRepository.GetAllUserSeriesAccessAsync();

        var stats = new UserSeriesAccessStatsDTO
        {
            TotalAccessRecords = accessRecords.Count(),
            TotalUsers = accessRecords.Select(a => a.UserId).Distinct().Count(),
            TotalSeries = accessRecords.Select(a => a.SeriesId).Distinct().Count(),
            AverageAccessibleSequence = accessRecords.Any() ? accessRecords.Average(a => a.CurrentAccessibleSequence) : 0
        };

        return stats;
    }

    public async Task<UserSeriesAccessResponseDTO> GrantAccessAsync(GrantAccessRequest request)
    {
        // Check if access already exists
        var existingAccess = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(request.UserId, request.SeriesId);
        if (existingAccess != null)
        {
            throw new InvalidOperationException("User already has access to this series");
        }

        var access = new UserSeriesAccess
        {
            UserId = request.UserId,
            SeriesId = request.SeriesId,
            CurrentAccessibleSequence = 1,
        };

        var createdAccess = await _userSeriesAccessRepository.CreateUserSeriesAccessAsync(access);
        return _mapper.Map<UserSeriesAccessResponseDTO>(createdAccess);
    }

    public async Task RevokeAccessAsync(RevokeAccessRequest request)
    {
        var access = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(request.UserId, request.SeriesId);
        if (access == null)
        {
            throw new InvalidOperationException("Access record not found");
        }

        await _userSeriesAccessRepository.DeleteUserSeriesAccessAsync(access.UserSeriesAccessId);
    }

    public async Task<BulkGrantAccessResponseDTO> BulkGrantAccessToAllUsersAsync()
    {
        // Step 1: Get all users and all series
        var users = await _userRepository.GetAllUsersAsync();
        var series = await _podcastSeriesRepository.GetAllPodcastSeriesAsync();

        // Step 2: Get all existing user-series access combinations
        // This ensures we only create access for combinations that don't already exist
        var existingAccesses = await _userSeriesAccessRepository.GetAllUserSeriesAccessAsync();
        var existingAccessSet = existingAccesses
            .Select(a => (a.UserId, a.SeriesId))
            .ToHashSet();

        // Step 3: Identify which user-series combinations need access
        var accessesToCreate = new List<UserSeriesAccess>();
        int skippedCount = 0;

        foreach (var user in users)
        {
            foreach (var serie in series)
            {
                // Check if this user already has access to this series
                bool userHasAccess = existingAccessSet.Contains((user.UserId, serie.SeriesId));

                if (userHasAccess)
                {
                    skippedCount++;
                    continue; // User already has access, skip
                }

                // User doesn't have access, add to creation list
                accessesToCreate.Add(new UserSeriesAccess
                {
                    UserId = user.UserId,
                    SeriesId = serie.SeriesId,
                    CurrentAccessibleSequence = 1, // Grant access to first episode
                });
            }
        }

        // Step 4: Bulk insert all new accesses
        int grantedCount = 0;
        if (accessesToCreate.Any())
        {
            var successfullyCreated = await _userSeriesAccessRepository.BulkCreateUserSeriesAccessAsync(accessesToCreate);
            grantedCount = successfullyCreated.Count();
        }

        return new BulkGrantAccessResponseDTO
        {
            TotalUsers = users.Count(),
            TotalSeries = series.Count(),
            GrantedCount = grantedCount,
            SkippedCount = skippedCount,
            Message = $"Successfully granted access to {grantedCount} user-series combinations. Skipped {skippedCount} existing access records."
        };
    }

    public async Task<BulkGrantAccessResponseDTO> IncrementAccessibleSequenceForCompletedEpisodesAsync()
    {
        // Step 1: Get all completed episode progresses
        var completedProgresses = await _userProgressRepository.GetCompletedEpisodeProgressesAsync();

        if (!completedProgresses.Any())
        {
            return new BulkGrantAccessResponseDTO
            {
                TotalUsers = 0,
                TotalSeries = 0,
                GrantedCount = 0,
                SkippedCount = 0,
                Message = "No completed episodes found."
            };
        }

        // Step 2: Group completed episodes by user and series
        // For each user-series combination, find the highest completed sequence number
        var completedEpisodesByUserSeries = new Dictionary<(int UserId, int SeriesId), int>();
        
        foreach (var progress in completedProgresses)
        {
            if (!progress.EpisodeId.HasValue || progress.PodcastEpisodes == null)
                continue;

            var episode = progress.PodcastEpisodes;
            var seriesId = episode.SeriesId;
            var userId = progress.UserId;
            var episodeSequenceNumber = episode.SequenceNumber;

            var key = (userId, seriesId);
            
            // Track the highest completed sequence number for each user-series combination
            if (!completedEpisodesByUserSeries.ContainsKey(key))
            {
                completedEpisodesByUserSeries[key] = episodeSequenceNumber;
            }
            else
            {
                completedEpisodesByUserSeries[key] = Math.Max(completedEpisodesByUserSeries[key], episodeSequenceNumber);
            }
        }

        // Step 3: For each user-series combination, check if we should increment
        int updatedCount = 0;
        int skippedCount = 0;

        foreach (var kvp in completedEpisodesByUserSeries)
        {
            var (userId, seriesId) = kvp.Key;
            var highestCompletedSequence = kvp.Value;

            // Get user's access for this series
            var userAccess = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, seriesId);
            
            if (userAccess == null)
            {
                skippedCount++;
                continue; // User doesn't have access to this series
            }

            // If the highest completed sequence matches the current accessible sequence,
            // it means user has completed the current accessible episode, so increment
            if (highestCompletedSequence == userAccess.CurrentAccessibleSequence)
            {
                userAccess.CurrentAccessibleSequence++;
                await _userSeriesAccessRepository.UpdateUserSeriesAccessAsync(userAccess);
                updatedCount++;
            }
            else
            {
                skippedCount++;
            }
        }

        return new BulkGrantAccessResponseDTO
        {
            TotalUsers = completedEpisodesByUserSeries.Keys.Select(k => k.UserId).Distinct().Count(),
            TotalSeries = completedEpisodesByUserSeries.Keys.Select(k => k.SeriesId).Distinct().Count(),
            GrantedCount = updatedCount,
            SkippedCount = skippedCount,
            Message = $"Successfully incremented accessible sequence for {updatedCount} user-series combinations. Skipped {skippedCount} records."
        };
    }

}
