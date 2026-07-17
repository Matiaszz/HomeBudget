using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Repositories;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Services;

/// <summary>
/// Serviço que implementa as regras de negócio de gerenciamento de famílias e seus familiares.
/// </summary>
public class FamilyService : IFamilyService
{
    private readonly IFamilyRepository _familyRepository;
    private readonly IUserRepository _userRepository;

    public FamilyService(IFamilyRepository familyRepository, IUserRepository userRepository)
    {
        _familyRepository = familyRepository;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Obtém todas as famílias associadas a um usuário logado.
    /// </summary>
    /// <param name="userId">Identificador do usuário.</param>
    /// <returns>Lista de DTOs contendo as famílias encontradas.</returns>
    public async Task<List<FamilyDto>> GetUserFamiliesAsync(Guid userId)
    {
        // 1. Validar se o usuário existe
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new BusinessException("USER_NOT_FOUND", "Usuário não encontrado.");
        }

        // 2. Buscar as famílias associadas ao usuário no banco
        var families = await _familyRepository.GetUserFamiliesAsync(userId);
        return families.Select(f => new FamilyDto
        {
            Id = f.Id,
            Name = f.Name
        }).ToList();
    }

    /// <summary>
    /// Cria uma nova família e a associa ao usuário criador (relacionamento Many-To-Many).
    /// </summary>
    /// <param name="userId">Identificador do usuário criador.</param>
    /// <param name="familyName">Nome da família a ser criada.</param>
    /// <returns>DTO da família criada.</returns>
    public async Task<FamilyDto> CreateFamilyAsync(Guid userId, string familyName)
    {
        // 1. Buscar o usuário com suas famílias já carregadas
        var user = await _userRepository.GetByIdWithFamiliesAsync(userId);
        if (user == null)
        {
            throw new BusinessException("USER_NOT_FOUND", "Usuário não encontrado.");
        }

        // 2. Instanciar a nova família
        var family = new Family
        {
            Name = familyName
        };

        // 3. Vincular o usuário criador à família e salvar
        family.Users.Add(user);
        await _familyRepository.AddFamilyAsync(family);
        await _familyRepository.SaveChangesAsync();

        return new FamilyDto
        {
            Id = family.Id,
            Name = family.Name
        };
    }

    /// <summary>
    /// Adiciona um novo familiar a uma família existente.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="request">Dados de criação do familiar (nome, idade).</param>
    /// <returns>DTO do familiar criado.</returns>
    public async Task<FamiliarDto> CreateFamiliarAsync(Guid familyId, CreateFamiliarRequest request)
    {
        // 1. Verificar se a família informada existe
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Instanciar o familiar
        var familiar = new Familiar
        {
            Name = request.Name,
            Age = request.Age,
            FamilyId = familyId
        };

        // 3. Persistir o familiar no banco
        await _familyRepository.AddFamiliarAsync(familiar);
        await _familyRepository.SaveChangesAsync();

        return new FamiliarDto
        {
            Id = familiar.Id,
            Name = familiar.Name,
            Age = familiar.Age
        };
    }

    /// <summary>
    /// Obtém a listagem paginada de familiares pertencentes a uma família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="page">Número da página solicitada.</param>
    /// <param name="pageSize">Quantidade de registros por página.</param>
    /// <returns>Resultado paginado contendo a lista de familiares e metadados.</returns>
    public async Task<PagedResult<FamiliarDto>> GetFamiliarsAsync(Guid familyId, int page, int pageSize)
    {
        // 1. Validar se a família alvo existe
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
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="id">Identificador único do familiar.</param>
    /// <param name="request">Dados de atualização (nome, idade).</param>
    /// <returns>DTO do familiar atualizado.</returns>
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
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="id">Identificador único do familiar a ser excluído.</param>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
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
    /// <param name="userId">Identificador do usuário solicitante.</param>
    /// <param name="id">Identificador único da família.</param>
    /// <param name="request">Dados de atualização contendo o novo nome.</param>
    /// <returns>DTO da família atualizada.</returns>
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
    /// <param name="userId">Identificador do usuário solicitante.</param>
    /// <param name="id">Identificador único da família a ser excluída.</param>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
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
