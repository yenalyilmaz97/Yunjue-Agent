using AutoMapper;
using KeciApp.API.Models;
using KeciApp.API.DTOs;
using KeciApp.API.Interfaces;
//using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace KeciApp.API.Services;
public class AphorismsService : IAphorismsService
{
    private readonly IAphorismsRepository _aphorismsRepository;
    private readonly IMapper _mapper;

    public AphorismsService(IAphorismsRepository aphorismsRepository, IMapper mapper)
    {
        _aphorismsRepository = aphorismsRepository;
        _mapper = mapper;
    }
    public async Task<IEnumerable<AphorismResponseDTO>> GetAllAphorismsAsync()
    {
        var aphorisms = await _aphorismsRepository.GetAllAphorismAsync();
        return _mapper.Map<IEnumerable<AphorismResponseDTO>>(aphorisms);
    }
    public async Task<AphorismResponseDTO> GetAphorismByIdAsync(int aphorismId)
    {
        var aphorism = await _aphorismsRepository.GetAphorismByIdAsync(aphorismId);
        if (aphorism == null)
        {
            throw new InvalidOperationException("Aphorism Not Found");
        }

        return _mapper.Map<AphorismResponseDTO>(aphorism);
    }
    public async Task<AphorismResponseDTO> AddAphorismAsync(CretaeAphorismRequest request)
    {
        var maxOrder = await _aphorismsRepository.GetMaxAphorismOrderAsync();
        var aphorism = _mapper.Map<Aphorisms>(request);
        aphorism.order = maxOrder + 1;
        var createdAphorism = await _aphorismsRepository.CreateAphorismAsync(aphorism);
        return _mapper.Map<AphorismResponseDTO>(createdAphorism);
    }
    public async Task<AphorismResponseDTO> EditAphorismAsync(EditAphorismRequest request)
    {
        var aphorism = await _aphorismsRepository.GetAphorismByIdAsync(request.AphorismId);
        if (aphorism == null)
        {
            throw new InvalidOperationException("Aphorism Not Found");
        }

        _mapper.Map(request, aphorism);
        var updatedAphorism = await _aphorismsRepository.UpdateAphorismAsync(aphorism);
        return _mapper.Map<AphorismResponseDTO>(updatedAphorism);
    }
    public async Task<AphorismResponseDTO> DeleteAphorismAsync(int aphorismId)
    {
        var aphorism = await _aphorismsRepository.GetAphorismByIdAsync(aphorismId);

        if (aphorism == null)
        {
            throw new InvalidOperationException("Aphorism Not Found");
        }

        await _aphorismsRepository.RemoveAphorismAsync(aphorism);
        return _mapper.Map<AphorismResponseDTO>(aphorism);
    }
}
