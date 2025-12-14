using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IUserProgressRepository
{
    Task<IEnumerable<UserProgress>> GetAllUserProgressByUserIdAsync(int userId);
    Task<UserProgress?> GetUserProgressByUserIdAndWeekIdAsync(int userId, int weekId);
    Task<UserProgress?> GetUserProgressByUserIdAndArticleIdAsync(int userId, int articleId);
    Task<UserProgress?> GetUserProgressByUserIdAndDailyContentIdAsync(int userId, int dailyContentId);
    Task<UserProgress?> GetUserProgressByUserIdAndEpisodeIdAsync(int userId, int episodeId);
    Task<UserProgress?> GetUserProgressByIdAsync(int userProgressId);
    Task<UserProgress> CreateUserProgressAsync(UserProgress userProgress);
    Task<UserProgress> UpdateUserProgressAsync(UserProgress userProgress);
    Task RemoveUserProgressAsync(UserProgress userProgress);
    Task<IEnumerable<UserProgress>> GetCompletedEpisodeProgressesAsync();
}

