using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IUserSeriesAccessService
{
    Task<IEnumerable<UserSeriesAccessResponseDTO>> GetAllUserSeriesAccessAsync();
    Task<UserSeriesAccessResponseDTO> GetUserSeriesAccessByIdAsync(int id);
    Task<IEnumerable<UserSeriesAccessResponseDTO>> GetUserSeriesAccessByUserIdAsync(int userId);
    Task<UserSeriesAccessResponseDTO> GetUserSeriesAccessByUserIdAndSeriesIdAsync(int userId, int seriesId);
    Task<UserSeriesAccessResponseDTO> CreateUserSeriesAccessAsync(CreateUserSeriesAccessRequest request);
    Task<UserSeriesAccessResponseDTO> UpdateUserSeriesAccessAsync(int id, UpdateUserSeriesAccessRequest request);
    Task DeleteUserSeriesAccessAsync(int id);
    Task<UserSeriesAccessStatsDTO> GetUserSeriesAccessStatsAsync();
    Task<UserSeriesAccessResponseDTO> GrantAccessAsync(GrantAccessRequest request);
    Task RevokeAccessAsync(RevokeAccessRequest request);
}
