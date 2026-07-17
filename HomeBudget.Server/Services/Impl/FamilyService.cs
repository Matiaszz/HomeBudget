using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Repositories;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Services;

public class FamilyService : IFamilyService
{
    private readonly IFamilyRepository _familyRepository;
    private readonly IUserRepository _userRepository;

    public FamilyService(IFamilyRepository familyRepository, IUserRepository userRepository)
    {
        _familyRepository = familyRepository;
        _userRepository = userRepository;
    }

    public async Task<List<FamilyDto>> GetUserFamiliesAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new BusinessException("USER_NOT_FOUND", "Usuário não encontrado.");
        }

        var families = await _familyRepository.GetUserFamiliesAsync(userId);
        return families.Select(f => new FamilyDto
        {
            Id = f.Id,
            Name = f.Name
        }).ToList();
    }

    public async Task<FamilyDto> CreateFamilyAsync(Guid userId, string familyName)
    {
        var user = await _userRepository.GetByIdWithFamiliesAsync(userId);
        if (user == null)
        {
            throw new BusinessException("USER_NOT_FOUND", "Usuário não encontrado.");
        }

        var family = new Family
        {
            Name = familyName
        };

        family.Users.Add(user);
        await _familyRepository.AddFamilyAsync(family);
        await _familyRepository.SaveChangesAsync();

        return new FamilyDto
        {
            Id = family.Id,
            Name = family.Name
        };
    }

    public async Task<FamiliarDto> CreateFamiliarAsync(Guid familyId, CreateFamiliarRequest request)
    {
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        var familiar = new Familiar
        {
            Name = request.Name,
            Age = request.Age,
            FamilyId = familyId
        };

        await _familyRepository.AddFamiliarAsync(familiar);
        await _familyRepository.SaveChangesAsync();

        return new FamiliarDto
        {
            Id = familiar.Id,
            Name = familiar.Name,
            Age = familiar.Age
        };
    }

    public async Task<List<FamiliarDto>> GetFamiliarsAsync(Guid familyId)
    {
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        var familiars = await _familyRepository.GetFamiliarsAsync(familyId);
        return familiars.Select(f => new FamiliarDto
        {
            Id = f.Id,
            Name = f.Name,
            Age = f.Age
        }).ToList();
    }

    public async Task<FamiliarDto> UpdateFamiliarAsync(Guid familyId, Guid id, UpdateFamiliarRequest request)
    {
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        var familiar = await _familyRepository.GetFamiliarByIdAsync(id);
        if (familiar == null || familiar.FamilyId != familyId)
        {
            throw new BusinessException("FAMILIAR_NOT_FOUND", "Familiar não encontrado.");
        }

        familiar.Name = request.Name;
        familiar.Age = request.Age;

        await _familyRepository.SaveChangesAsync();

        return new FamiliarDto
        {
            Id = familiar.Id,
            Name = familiar.Name,
            Age = familiar.Age
        };
    }

    public async Task DeleteFamiliarAsync(Guid familyId, Guid id)
    {
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        var familiar = await _familyRepository.GetFamiliarByIdAsync(id);
        if (familiar == null || familiar.FamilyId != familyId)
        {
            throw new BusinessException("FAMILIAR_NOT_FOUND", "Familiar não encontrado.");
        }

        _familyRepository.DeleteFamiliar(familiar);
        await _familyRepository.SaveChangesAsync();
    }
}
