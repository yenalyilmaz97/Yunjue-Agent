using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class AphorismsRepository : IAphorismsRepository
{
    private readonly AppDbContext _context;

    public AphorismsRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<Aphorisms>> GetAllAphorismAsync()
    {
        return await _context.Aphorisms.ToListAsync();
    }
    public async Task<Aphorisms?> GetAphorismByIdAsync(int aphorismId)
    {
        return await _context.Aphorisms.FindAsync(aphorismId);
    }
    public async Task<Aphorisms> CreateAphorismAsync(Aphorisms aphorisms)
    {
        _context.Aphorisms.Add(aphorisms);
        await _context.SaveChangesAsync();
        return aphorisms;
    }
    public async Task<Aphorisms> UpdateAphorismAsync(Aphorisms aphorisms)
    {
        _context.Aphorisms.Update(aphorisms);
        await _context.SaveChangesAsync();
        return aphorisms;
    }
    public async Task RemoveAphorismAsync(Aphorisms aphorisms)
    {
        _context.Aphorisms.Remove(aphorisms);
        await _context.SaveChangesAsync();
    }
    public async Task<int> GetMaxAphorismOrderAsync()
    {
        return await _context.Aphorisms.MaxAsync(a => a.order);
    }
    public async Task<int> GetAphorismIdByOrderAsync(int order)
    {
        return await _context.Aphorisms
            .Where(a => a.order == order)
            .Select(a => a.AphorismId)
            .FirstOrDefaultAsync();
    }
}
