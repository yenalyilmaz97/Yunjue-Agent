using KeciApp.API.Interfaces;
using KeciApp.API.Models;

namespace KeciApp.API.Services;

public class PopupService : IPopupService
{
    private readonly IPopupRepository _popupRepository;
    private readonly IUserRepository _userRepository;
    private readonly IFileUploadService _fileUploadService;

    public PopupService(
        IPopupRepository popupRepository,
        IUserRepository userRepository,
        IFileUploadService fileUploadService)
    {
        _popupRepository = popupRepository;
        _userRepository = userRepository;
        _fileUploadService = fileUploadService;
    }

    public async Task<Popup?> GetActivePopupForUserAsync(int userId)
    {
        var activePopup = await _popupRepository.GetActivePopupAsync();
        if (activePopup == null)
        {
            return null;
        }

        if (activePopup.Repeatable)
        {
            // If repeatable, always return it
            return activePopup;
        }

        // If not repeatable, check if user has seen it
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null || user.IsPopupSeen)
        {
            return null;
        }

        return activePopup;
    }

    public async Task<List<Popup>> GetAllPopupsAsync()
    {
        return await _popupRepository.GetAllPopupsAsync();
    }

    public async Task<Popup> CreatePopupAsync(string title, IFormFile imageFile, bool repeatable)
    {
        // 1. Upload Image
        string imageUrl = await _fileUploadService.UploadPopupImageAsync(imageFile, title);

        // 2. Deactivate all existing popups
        await _popupRepository.DeactivateAllPopupsAsync();

        // 3. Reset all users' IsPopupSeen status
        await _popupRepository.ResetAllUsersPopupSeenAsync();

        // 4. Create new popup
        var popup = new Popup
        {
            Title = title,
            ImageUrl = imageUrl,
            IsActive = true,
            Repeatable = repeatable,
            CreatedAt = DateTime.UtcNow
        };

        return await _popupRepository.CreatePopupAsync(popup);
    }

    public async Task<Popup> UpdatePopupAsync(int id, string title, IFormFile? imageFile, bool repeatable)
    {
        var popup = await _popupRepository.GetPopupByIdAsync(id);
        if (popup == null)
        {
            throw new InvalidOperationException("Popup not found");
        }

        popup.Title = title;
        popup.Repeatable = repeatable;

        if (imageFile != null)
        {
            // Upload new image
            string imageUrl = await _fileUploadService.UploadPopupImageAsync(imageFile, title);
            
            // Delete old image if it exists (Optional, depending on cleanup policy)
            // await _fileUploadService.DeleteFileAsync(popup.ImageUrl);
            
            popup.ImageUrl = imageUrl;
        }

        return await _popupRepository.UpdatePopupAsync(popup);
    }

    public async Task ActivatePopupAsync(int id)
    {
        var popup = await _popupRepository.GetPopupByIdAsync(id);
        if (popup == null)
        {
            throw new InvalidOperationException("Popup not found");
        }

        // 1. Deactivate all existing popups
        await _popupRepository.DeactivateAllPopupsAsync();

        // 2. Activate specific popup
        popup.IsActive = true;
        await _popupRepository.UpdatePopupAsync(popup);

        // 3. Reset all users' IsPopupSeen status (so they see the new active popup)
        await _popupRepository.ResetAllUsersPopupSeenAsync();
    }

    public async Task DeletePopupAsync(int id)
    {
        var popup = await _popupRepository.GetPopupByIdAsync(id);
        if (popup == null)
        {
            throw new InvalidOperationException("Popup not found");
        }

        // Delete image file (Optional)
        await _fileUploadService.DeleteFileAsync(popup.ImageUrl);

        await _popupRepository.DeletePopupAsync(id);
    }

    public async Task MarkPopupAsSeenAsync(int userId)
    {
        await _popupRepository.MarkUserAsSeenAsync(userId);
    }
}
