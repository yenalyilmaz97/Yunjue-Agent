using Microsoft.EntityFrameworkCore;
using System.Linq;
using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Repositories;
public class AffirmationRepository : IAffirmationRepository
{
    private readonly AppDbContext _context;

    public AffirmationRepository(AppDbContext context)
    {
        _context = context;
    }
    
    //Affirmations 
    public async Task<IEnumerable<Affirmations>> GetAllAffirmationsAsync()
    {
        return await _context.Affirmations.ToListAsync();
    }

    public async Task<Affirmations?> GetAffirmationByIdAsync(int affirmationId)
    {
        return await _context.Affirmations.FindAsync(affirmationId);
    }

    public async Task<Affirmations> CreateAffirmationAsync(Affirmations affirmations)
    {
        _context.Affirmations.Add(affirmations);
        await _context.SaveChangesAsync();
        return affirmations;
    }

    public async Task<Affirmations> UpdateAffirmationAsync(Affirmations affirmations)
    {
        _context.Affirmations.Update(affirmations);
        await _context.SaveChangesAsync();
        return affirmations;
    }

    public async Task RemoveAffirmationAsync(Affirmations affirmations)
    {
        _context.Affirmations.Remove(affirmations);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetMaxAffirmationOrderAsync()
    {
        return await _context.Affirmations.MaxAsync(a => a.order);
    }

    public async Task<int> GetAffirmationIdByOrderAsync(int order)
    {
        return await _context.Affirmations
            .Where(a => a.order == order)
            .Select(a => a.AffirmationId)
            .FirstOrDefaultAsync();
    }

}

