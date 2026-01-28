using KeciApp.API.Models;

namespace KeciApp.API.Interfaces;

public interface IPopupService
{
    Task<Popup?> GetActivePopupForUserAsync(int userId);
    Task<Popup> CreatePopupAsync(string title, IFormFile imageFile, bool repeatable);
    Task<Popup> UpdatePopupAsync(int id, string title, IFormFile? imageFile, bool repeatable);
    Task ActivatePopupAsync(int id);
    Task DeletePopupAsync(int id);
    Task MarkPopupAsSeenAsync(int userId);
}
