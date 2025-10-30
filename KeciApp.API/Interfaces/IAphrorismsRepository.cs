using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;
public interface IAphorismsRepository
{
    Task<IEnumerable<Aphorisms>> GetAllAphorismAsync();
    Task<Aphorisms?> GetAphorismByIdAsync(int aphorismId);
    Task<Aphorisms> CreateAphorismAsync(Aphorisms aphorism);
    Task<Aphorisms> UpdateAphorismAsync(Aphorisms aphorism);
    Task RemoveAphorismAsync(Aphorisms aphorisms);
    Task<int> GetMaxAphorismOrderAsync();
    Task<int> GetAphorismIdByOrderAsync(int order);
}
