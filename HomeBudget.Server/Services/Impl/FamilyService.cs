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

    public async Task<PagedResult<FamiliarDto>> GetFamiliarsAsync(Guid familyId, int page, int pageSize)
    {
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        var (familiars, totalCount) = await _familyRepository.GetFamiliarsPaginatedAsync(familyId, page, pageSize);
        
        return new PagedResult<FamiliarDto>
        {
            Items = familiars.Select(f => new FamiliarDto
            {
                Id = f.Id,
                Name = f.Name,
                Age = f.Age
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    /// <summary>
    /// Atualiza os dados de um familiar específico.
    /// Valida a existência da família correspondente e se o familiar pertence de fato a ela.
    /// </summary>
    public async Task<FamiliarDto> UpdateFamiliarAsync(Guid familyId, Guid id, UpdateFamiliarRequest request)
    {
        // 1. Validar se a família alvo existe no banco
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Buscar o familiar e garantir que ele pertença à família informada
        var familiar = await _familyRepository.GetFamiliarByIdAsync(id);
        if (familiar == null || familiar.FamilyId != familyId)
        {
            throw new BusinessException("FAMILIAR_NOT_FOUND", "Familiar não encontrado.");
        }

        // 3. Atualizar e persistir as alterações
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

    /// <summary>
    /// Exclui um familiar de uma família.
    /// Valida se a família e o familiar existem e se pertencem um ao outro antes de deletar.
    /// </summary>
    public async Task DeleteFamiliarAsync(Guid familyId, Guid id)
    {
        // 1. Validar se a família existe
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Validar se o familiar existe e se pertence a essa família
        var familiar = await _familyRepository.GetFamiliarByIdAsync(id);
        if (familiar == null || familiar.FamilyId != familyId)
        {
            throw new BusinessException("FAMILIAR_NOT_FOUND", "Familiar não encontrado.");
        }

        // 3. Remover o familiar da base de dados
        _familyRepository.DeleteFamiliar(familiar);
        await _familyRepository.SaveChangesAsync();
    }

    /// <summary>
    /// Atualiza o nome da família informada.
    /// Verifica se a família existe e se pertence ao usuário autenticado (controle de acesso).
    /// </summary>
    public async Task<FamilyDto> UpdateFamilyAsync(Guid userId, Guid id, UpdateFamilyRequest request)
    {
        // 1. Buscar todas as famílias associadas a este usuário
        var userFamilies = await _familyRepository.GetUserFamiliesAsync(userId);
        
        // 2. Garantir que a família alvo esteja associada ao usuário (segurança)
        var family = userFamilies.FirstOrDefault(f => f.Id == id);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada ou você não tem permissão para acessá-la.");
        }

        // 3. Atualizar e salvar o novo nome
        family.Name = request.Name;
        await _familyRepository.SaveChangesAsync();

        return new FamilyDto
        {
            Id = family.Id,
            Name = family.Name
        };
    }

    /// <summary>
    /// Exclui permanentemente uma família informada.
    /// Verifica se a família existe e se pertence ao usuário autenticado (controle de acesso).
    /// </summary>
    public async Task DeleteFamilyAsync(Guid userId, Guid id)
    {
        // 1. Obter famílias do usuário para verificar permissão
        var userFamilies = await _familyRepository.GetUserFamiliesAsync(userId);
        
        // 2. Garantir que a família de fato pertença ao usuário
        var family = userFamilies.FirstOrDefault(f => f.Id == id);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada ou você não tem permissão para acessá-la.");
        }

        // 3. Excluir a família e salvar alterações
        _familyRepository.DeleteFamily(family);
        await _familyRepository.SaveChangesAsync();
    }
}
