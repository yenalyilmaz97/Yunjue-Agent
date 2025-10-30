using KeciApp.API.DTOs;

namespace KeciApp.API.Interfaces;
public interface IAffirmationsService
{
    Task<IEnumerable<AffirmationResponseDTO>> GetAllAffirmationsAsync();
    Task<AffirmationResponseDTO> GetAffirmationByIdAsync(int affirmationId);
    Task<AffirmationResponseDTO> AddAffirmationAsync(CreateAffirmationRequest affirmation);
    Task<AffirmationResponseDTO> EditAffirmationAsync(EditAffirmationRequest affirmation);
    Task<AffirmationResponseDTO> DeleteAffirmationAsync(int affirmationId);
}
