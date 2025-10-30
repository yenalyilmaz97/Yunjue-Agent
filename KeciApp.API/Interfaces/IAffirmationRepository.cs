using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IAffirmationRepository
{
    Task<IEnumerable<Affirmations>> GetAllAffirmationsAsync();
    Task<Affirmations?> GetAffirmationByIdAsync(int affirmationId);
    Task<Affirmations> CreateAffirmationAsync(Affirmations affirmation);
    Task<Affirmations> UpdateAffirmationAsync(Affirmations affirmation);
    Task RemoveAffirmationAsync(Affirmations affirmation);
    Task<int> GetMaxAffirmationOrderAsync();
    Task<int> GetAffirmationIdByOrderAsync(int order);
}
