using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IUserSeriesAccessRepository
{
    Task<IEnumerable<UserSeriesAccess>> GetAllUserSeriesAccessAsync();
    Task<UserSeriesAccess?> GetUserSeriesAccessByIdAsync(int id);
    Task<IEnumerable<UserSeriesAccess>> GetUserSeriesAccessByUserIdAsync(int userId);
    Task<UserSeriesAccess?> GetUserSeriesAccessAsync(int userId, int? seriesId);
    Task<UserSeriesAccess> CreateUserSeriesAccessAsync(UserSeriesAccess access);
    Task<UserSeriesAccess> UpdateUserSeriesAccessAsync(UserSeriesAccess access);
    Task DeleteUserSeriesAccessAsync(int accessId);
    Task<IEnumerable<UserSeriesAccess>> BulkCreateUserSeriesAccessAsync(IEnumerable<UserSeriesAccess> accesses);

}
