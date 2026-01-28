using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IPopupRepository
{
    Task<Popup?> GetActivePopupAsync();
    Task<Popup?> GetPopupByIdAsync(int id);
    Task<Popup> CreatePopupAsync(Popup popup);
    Task<Popup> UpdatePopupAsync(Popup popup);
    Task DeletePopupAsync(int id);
    Task DeactivateAllPopupsAsync();
    Task ResetAllUsersPopupSeenAsync();
    Task MarkUserAsSeenAsync(int userId);
}
