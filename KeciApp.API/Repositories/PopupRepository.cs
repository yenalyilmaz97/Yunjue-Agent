using KeciApp.API.Data;
using KeciApp.API.Interfaces;
using KeciApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KeciApp.API.Repositories;

public class PopupRepository : IPopupRepository
{
    private readonly AppDbContext _context;

    public PopupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Popup?> GetActivePopupAsync()
    {
        return await _context.Popups
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Popup>> GetAllPopupsAsync()
    {
        return await _context.Popups
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Popup?> GetPopupByIdAsync(int id)
    {
        return await _context.Popups.FindAsync(id);
    }

    public async Task<Popup> CreatePopupAsync(Popup popup)
    {
        _context.Popups.Add(popup);
        await _context.SaveChangesAsync();
        return popup;
    }

    public async Task<Popup> UpdatePopupAsync(Popup popup)
    {
        _context.Popups.Update(popup);
        await _context.SaveChangesAsync();
        return popup;
    }

    public async Task DeletePopupAsync(int id)
    {
        var popup = await _context.Popups.FindAsync(id);
        if (popup != null)
        {
            _context.Popups.Remove(popup);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeactivateAllPopupsAsync()
    {
        var activePopups = await _context.Popups.Where(p => p.IsActive).ToListAsync();
        foreach (var popup in activePopups)
        {
            popup.IsActive = false;
        }
        await _context.SaveChangesAsync();
    }

    public async Task ResetAllUsersPopupSeenAsync()
    {
        // Using ExecuteSqlRaw for bulk update performance
        await _context.Database.ExecuteSqlRawAsync("UPDATE \"Users\" SET \"IsPopupSeen\" = false");
    }

    public async Task MarkUserAsSeenAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.IsPopupSeen = true;
            await _context.SaveChangesAsync();
        }
    }
}
