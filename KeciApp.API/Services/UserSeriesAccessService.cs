using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Repositories;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;
public class UserSeriesAccessService : IUserSeriesAccessService
{
    private readonly IUserSeriesAccessRepository _userSeriesAccessRepository;
    private readonly IMapper _mapper;

    public UserSeriesAccessService(IUserSeriesAccessRepository userSeriesAccessRepository, IMapper mapper)
    {
        _userSeriesAccessRepository = userSeriesAccessRepository;
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

}
