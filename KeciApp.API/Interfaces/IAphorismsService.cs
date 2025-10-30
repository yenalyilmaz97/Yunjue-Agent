using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IAphorismsService
{
    Task<IEnumerable<AphorismResponseDTO>> GetAllAphorismsAsync();
    Task<AphorismResponseDTO> GetAphorismByIdAsync(int aphorismId);
    Task<AphorismResponseDTO> AddAphorismAsync(CretaeAphorismRequest aphorism);
    Task<AphorismResponseDTO> EditAphorismAsync(EditAphorismRequest aphorism);
    Task<AphorismResponseDTO> DeleteAphorismAsync(int aphorismId);
}
