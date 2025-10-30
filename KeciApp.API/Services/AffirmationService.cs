using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Repositories;
using KeciApp.API.Interfaces;

namespace KeciApp.API.Services;

public class AffirmationService : IAffirmationsService
{
    private readonly IAffirmationRepository _affirmationRepository;
    private readonly IMapper _mapper;

    public AffirmationService(IAffirmationRepository affirmationRepository, IMapper mapper)
    {
        _affirmationRepository = affirmationRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AffirmationResponseDTO>> GetAllAffirmationsAsync()
    {
        var affirmations = await _affirmationRepository.GetAllAffirmationsAsync();
        return _mapper.Map<IEnumerable<AffirmationResponseDTO>>(affirmations);
    }
    public async Task<AffirmationResponseDTO> GetAffirmationByIdAsync(int affirmationId)
    {
        var affirmation = await _affirmationRepository.GetAffirmationByIdAsync(affirmationId);
        if (affirmation == null)
        {
            throw new InvalidOperationException("Affirmation Not Found");
        }

        return _mapper.Map<AffirmationResponseDTO>(affirmation);
    }
    public async Task<AffirmationResponseDTO> AddAffirmationAsync(CreateAffirmationRequest request)
    {
        var maxOrder = await _affirmationRepository.GetMaxAffirmationOrderAsync();
        var affirmation = _mapper.Map<Affirmations>(request);
        affirmation.order = maxOrder + 1;
        var createdAffirmation = await _affirmationRepository.CreateAffirmationAsync(affirmation);
        return _mapper.Map<AffirmationResponseDTO>(createdAffirmation);
    }
    public async Task<AffirmationResponseDTO> EditAffirmationAsync(EditAffirmationRequest request)
    {
        var affirmation = await _affirmationRepository.GetAffirmationByIdAsync(request.AffirmationId);
        if (affirmation == null)
        {
            throw new InvalidOperationException("Affirmation Not Found");
        }
        _mapper.Map(request, affirmation);
        var updatedAffirmation = await _affirmationRepository.UpdateAffirmationAsync(affirmation);
        return _mapper.Map<AffirmationResponseDTO>(updatedAffirmation);
    }
    public async Task<AffirmationResponseDTO> DeleteAffirmationAsync(int affirmationId)
    {
        var affirmation = await _affirmationRepository.GetAffirmationByIdAsync(affirmationId);
        if (affirmation == null)
        {
            throw new InvalidOperationException("Affirmation Not Found");
        }

        await _affirmationRepository.RemoveAffirmationAsync(affirmation);
        return _mapper.Map<AffirmationResponseDTO>(affirmation);
    }

}
