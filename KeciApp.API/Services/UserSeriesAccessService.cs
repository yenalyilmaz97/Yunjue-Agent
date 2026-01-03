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
    private readonly IWeeklyRepository _weeklyRepository;
    private readonly IArticleRepository _articleRepository;
    private readonly IMapper _mapper;

    public UserSeriesAccessService(
        IUserSeriesAccessRepository userSeriesAccessRepository, 
        IUserRepository userRepository,
        IPodcastSeriesRepository podcastSeriesRepository,
        IUserProgressRepository userProgressRepository,
        IPodcastEpisodesRepository podcastEpisodesRepository,
        IWeeklyRepository weeklyRepository,
        IArticleRepository articleRepository,
        IMapper mapper)
    {
        _userSeriesAccessRepository = userSeriesAccessRepository;
        _userRepository = userRepository;
        _podcastSeriesRepository = podcastSeriesRepository;
        _userProgressRepository = userProgressRepository;
        _podcastEpisodesRepository = podcastEpisodesRepository;
        _weeklyRepository = weeklyRepository;
        _articleRepository = articleRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserSeriesAccessResponseDTO>> GetAllUserSeriesAccessAsync()
    {
        var accessRecords = await _userSeriesAccessRepository.GetAllUserSeriesAccessAsync();
        var dtos = _mapper.Map<IEnumerable<UserSeriesAccessResponseDTO>>(accessRecords).ToList();
        
        // Fetch all article accesses (SeriesId == null) to populate ArticleOrder on other records
        var articleAccesses = accessRecords.Where(a => a.SeriesId == null).ToDictionary(a => a.UserId, a => a.CurrentAccessibleSequence);

        foreach (var dto in dtos)
        {
            if (articleAccesses.TryGetValue(dto.UserId, out int order))
            {
                dto.ArticleOrder = order;
            }
            else 
            {
                dto.ArticleOrder = 1; // Default
            }
        }
        
        return dtos;
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

        // 1. If this is an Article Access record (SeriesId is null), we must update ArticleId based on the new sequence
        if (existingAccess.SeriesId == null)
        {
            // For/Article access, the "CurrentAccessibleSequence" IS the Article Order.
            // Ideally we also look at request.ArticleOrder if provided, but request.CurrentAccessibleSequence is the primary form field.
            int newOrder = request.ArticleOrder ?? request.CurrentAccessibleSequence;
            
            var article = await _articleRepository.GetArticleByOrderAsync(newOrder);
            if (article != null)
            {
                existingAccess.ArticleId = article.ArticleId;
                existingAccess.CurrentAccessibleSequence = article.Order;
            }
            else
            {
                // Fallback if no article found for this order: just update the number (though data will be potentially inconsistent)
                existingAccess.CurrentAccessibleSequence = newOrder;
            }
        }
        else 
        {
            // 2. Regular Series Access Update
            existingAccess.CurrentAccessibleSequence = request.CurrentAccessibleSequence;
            
            // 3. Side-effect: If ArticleOrder is specifically provided while updating a Series record
            if (request.ArticleOrder.HasValue) 
            {
                await UpdateArticleAccessForUserAsync(existingAccess.UserId, request.ArticleOrder.Value);
            }
        }

        var updatedAccess = await _userSeriesAccessRepository.UpdateUserSeriesAccessAsync(existingAccess);
        
        var response = _mapper.Map<UserSeriesAccessResponseDTO>(updatedAccess);
        
        // Populate ArticleOrder in response
        var articleAccess = await GetCurrentArticleAccessAsync(existingAccess.UserId);
        if (articleAccess != null) {
            response.ArticleOrder = articleAccess.CurrentAccessibleSequence;
        }

        return response;
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
        var existingAccesses = await _userSeriesAccessRepository.GetAllUserSeriesAccessAsync();
        
        // Use a ValueTuple for the key to handle nullable SeriesId correctly
        // Key: (UserId, SeriesId)
        var existingAccessSet = existingAccesses
            .Select(a => (a.UserId, a.SeriesId))
            .ToHashSet();

        // Step 3: Identify which user-series combinations need access
        var accessesToCreate = new List<UserSeriesAccess>();
        int skippedCount = 0;

        // A. Handle Series Access
        foreach (var user in users)
        {
            foreach (var serie in series)
            {
                if (existingAccessSet.Contains((user.UserId, serie.SeriesId)))
                {
                    skippedCount++;
                    continue;
                }

                accessesToCreate.Add(new UserSeriesAccess
                {
                    UserId = user.UserId,
                    SeriesId = serie.SeriesId,
                    ArticleId = null, // Explicitly null for series access
                    CurrentAccessibleSequence = 1,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        // B. Handle Article Access (SeriesId = null)
        // Verify we have an article to link to
        var article1 = await _articleRepository.GetArticleByOrderAsync(1);
        if (article1 == null)
        {
             // Fallback: Get the first article by order if Order=1 doesn't exist
             var allArticles = await _articleRepository.GetAllArticlesAsync();
             article1 = allArticles.FirstOrDefault();
        }
        
        int? article1Id = article1?.ArticleId;
        
        if (article1Id.HasValue)
        {
            // Identify users who ALREADY have a valid Article Access (ArticleId is set)
            // The user requested: "If record containing user id and article id exists -> Skip"
            // "If not -> Assign"
            var usersWithArticleAccess = existingAccesses
                .Where(a => a.ArticleId != null) // Strictly check for ArticleId, regardless of SeriesId (though practically SeriesId should be null)
                .Select(a => a.UserId)
                .ToHashSet();

            foreach (var user in users)
            {
                if (usersWithArticleAccess.Contains(user.UserId))
                {
                    continue; 
                }

                // Double check to prevent duplicates within the `accessesToCreate` list itself
                if (accessesToCreate.Any(a => a.UserId == user.UserId && a.ArticleId != null))
                {
                    continue;
                }

                accessesToCreate.Add(new UserSeriesAccess
                {
                    UserId = user.UserId,
                    SeriesId = null, // Articles don't belong to a series in this context
                    ArticleId = article1Id.Value, 
                    CurrentAccessibleSequence = article1?.Order ?? 1,
                    UpdatedAt = DateTime.UtcNow
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
            Message = $"Successfully granted access to {grantedCount} user-series/article combinations. Skipped {skippedCount} existing access records."
        };
    }

    public async Task<BulkGrantAccessResponseDTO> IncrementAccessibleSequenceForCompletedEpisodesAsync()
    {
        // Step 1: Update Series Access based on Completed Episodes
        var completedProgresses = await _userProgressRepository.GetCompletedEpisodeProgressesAsync();
        
        // Group completed episodes by user and series to find max completed sequence
        var completedEpisodesByUserSeries = new Dictionary<(int UserId, int SeriesId), int>();
        foreach (var progress in completedProgresses)
        {
            if (!progress.EpisodeId.HasValue || progress.PodcastEpisodes == null) continue;

            var key = (progress.UserId, progress.PodcastEpisodes.SeriesId);
            int seq = progress.PodcastEpisodes.SequenceNumber;
            
            if (!completedEpisodesByUserSeries.ContainsKey(key) || seq > completedEpisodesByUserSeries[key])
            {
                completedEpisodesByUserSeries[key] = seq;
            }
        }

        int updatedCount = 0;
        int skippedCount = 0;
        var usersWithSeriesActivity = new HashSet<int>();

        foreach (var kvp in completedEpisodesByUserSeries)
        {
            var (userId, seriesId) = kvp.Key;
            var highestCompletedSequence = kvp.Value;

            var userAccess = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, seriesId);
            if (userAccess == null)
            {
                skippedCount++;
                continue;
            }

            // If user finished the episode they were "on", bump them up
            if (highestCompletedSequence == userAccess.CurrentAccessibleSequence)
            {
                userAccess.CurrentAccessibleSequence++;
                await _userSeriesAccessRepository.UpdateUserSeriesAccessAsync(userAccess);
                updatedCount++;
                usersWithSeriesActivity.Add(userId);
            }
            else
            {
                skippedCount++;
            }
        }

        // Step 2: Check Weekly Advancement (Requires BOTH Article and Episode Completion)
        // Candidates: Users who just advanced a series OR users who have completed the relevant article
        var completedArticles = await _userProgressRepository.GetCompletedArticleProgressesAsync();
        var usersWithArticleActivity = completedArticles.Select(a => a.UserId).Distinct();
        
        var candidatesForWeeklyUpdate = usersWithSeriesActivity.Union(usersWithArticleActivity).Distinct().ToList();

        int weeklyContentUpdatedCount = 0;
        var allWeeklyContents = await _weeklyRepository.GetAllWeeklyContentAsync();
        int maxWeekOrder = allWeeklyContents.Any() ? allWeeklyContents.Max(wc => wc.WeekOrder) : 0;

        foreach (var userId in candidatesForWeeklyUpdate)
        {
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null || user.WeeklyContentId <= 0) continue;

            var currentWeeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(user.WeeklyContentId);
            if (currentWeeklyContent == null) continue;

            int currentWeekOrder = currentWeeklyContent.WeekOrder;

            // Check 1: Article Completion for Current Week
            // We assume Article.Order matches WeekOrder.
            var articleForWeek = await _articleRepository.GetArticleByOrderAsync(currentWeekOrder);
            bool isArticleCompleted = false;
            
            if (articleForWeek != null)
            {
                // Method to avoid redundant DB call inside loop if we could map from `completedArticles` list
                // but checking direct is safer/cleaner code-wise for now.
                var artProgress = await _userProgressRepository.GetUserProgressByUserIdAndArticleIdAsync(userId, articleForWeek.ArticleId);
                if (artProgress != null && artProgress.isCompleted)
                {
                    isArticleCompleted = true;
                }
            }
            else
            {
                // If no article exists for this week, assume completion (don't block)
                isArticleCompleted = true;
            }

            if (!isArticleCompleted) continue;

            // Check 2: Episode Completion for Current Week
            // We verify if ANY Series Access for the user has surpassed the current WeekOrder.
            // (Assumes Week N requires finishing Episode N, so Access should be > N, i.e., N+1).
            var userSeriesAccesses = await _userSeriesAccessRepository.GetUserSeriesAccessByUserIdAsync(userId);
            
            // Only consider actual Series (SeriesId != null)
            // If user has access to multiple series, finishing ANY of them potentially unlocks the week.
            // Requirement: "Episode value checked...". 
            // Condition: CurrentAccessibleSequence > currentWeekOrder.
            // Example: Week 1 requires Ep 1. Ep 1 Done -> Access is 2. 2 > 1 -> True.
            bool isEpisodeCompleted = userSeriesAccesses.Any(usa => usa.SeriesId.HasValue && usa.CurrentAccessibleSequence > currentWeekOrder);

            if (!isEpisodeCompleted) continue;


            // Both Met -> Advance Week
            if (maxWeekOrder > 0)
            {
                var nextWeekOrder = currentWeekOrder + 1;
                if (nextWeekOrder > maxWeekOrder)
                {
                    nextWeekOrder = 1; // Cycle
                }

                var nextWeeklyContent = allWeeklyContents.FirstOrDefault(wc => wc.WeekOrder == nextWeekOrder);
                if (nextWeeklyContent != null)
                {
                    user.WeeklyContentId = nextWeeklyContent.WeekId;
                    await _userRepository.UpdateUserAsync(user);
                    weeklyContentUpdatedCount++;

                    // Update Article Access to match the new Week
                    await UpdateArticleAccessForUserAsync(userId, nextWeeklyContent.WeekOrder);
                }
            }
        }

        return new BulkGrantAccessResponseDTO
        {
            TotalUsers = candidatesForWeeklyUpdate.Count,
            TotalSeries = completedEpisodesByUserSeries.Keys.Select(k => k.SeriesId).Distinct().Count(),
            GrantedCount = updatedCount,
            SkippedCount = skippedCount,
            Message = $"Updated Series Access for {updatedCount} records. Advanced Weekly Content for {weeklyContentUpdatedCount} users."
        };
    }

    private async Task UpdateArticleAccessForUserAsync(int userId, int weekOrder)
    {
        // Article Order corresponds to WeekOrder
        var article = await _articleRepository.GetArticleByOrderAsync(weekOrder);
        if (article == null) return;

        var access = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, null); // SeriesId null for Articles
        if (access == null)
        {
            access = new UserSeriesAccess
            {
                UserId = userId,
                SeriesId = null,
                ArticleId = article.ArticleId,
                CurrentAccessibleSequence = article.Order,
                UpdatedAt = DateTime.UtcNow
            };
            await _userSeriesAccessRepository.CreateUserSeriesAccessAsync(access);
        }
        else
        {
            // Only update if new order is greater
            if (article.Order > access.CurrentAccessibleSequence)
            {
                access.ArticleId = article.ArticleId;
                access.CurrentAccessibleSequence = article.Order;
                access.UpdatedAt = DateTime.UtcNow;
                await _userSeriesAccessRepository.UpdateUserSeriesAccessAsync(access);
            }
        }
    }

    public async Task<UserSeriesAccessResponseDTO> GetCurrentArticleAccessAsync(int userId)
    {
        var access = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, null);
        
        if (access == null)
        {
            // Fallback: Check user's weekly content
            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user != null && user.WeeklyContentId > 0)
            {
                var weeklyContent = await _weeklyRepository.GetWeeklyContentByIdAsync(user.WeeklyContentId);
                if (weeklyContent != null)
                {
                    // Create entry
                    await UpdateArticleAccessForUserAsync(userId, weeklyContent.WeekOrder);
                    access = await _userSeriesAccessRepository.GetUserSeriesAccessAsync(userId, null);
                }
            }
        }

        if (access == null) return null;
        return _mapper.Map<UserSeriesAccessResponseDTO>(access);
    }
}
