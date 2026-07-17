using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;

namespace HomeBudget.Server.Services.Contracts;

/// <summary>
/// Interface contendo o contrato de negócio de operações relacionadas a famílias e familiares.
/// </summary>
public interface IFamilyService
{
    /// <summary>
    /// Obtém todas as famílias associadas a um usuário logado.
    /// </summary>
    /// <param name="userId">Identificador único do usuário.</param>
    /// <returns>Uma lista de DTOs representando as famílias encontradas.</returns>
    Task<List<FamilyDto>> GetUserFamiliesAsync(Guid userId);

    /// <summary>
    /// Cria uma nova família e a associa ao usuário solicitante.
    /// </summary>
    /// <param name="userId">Identificador único do usuário criador.</param>
    /// <param name="familyName">Nome da nova família.</param>
    /// <returns>O DTO da família recém-criada.</returns>
    Task<FamilyDto> CreateFamilyAsync(Guid userId, string familyName);

    /// <summary>
    /// Adiciona um novo familiar (membro) a uma família existente.
    /// </summary>
    /// <param name="familyId">Identificador único da família associada.</param>
    /// <param name="request">Dados de criação do familiar (nome e idade).</param>
    /// <returns>O DTO do familiar criado.</returns>
    Task<FamiliarDto> CreateFamiliarAsync(Guid familyId, CreateFamiliarRequest request);

    /// <summary>
    /// Obtém a listagem paginada de familiares pertencentes a uma família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="page">Número da página solicitada.</param>
    /// <param name="pageSize">Quantidade de registros por página.</param>
    /// <returns>Um resultado paginado contendo a lista de familiares e metadados de paginação.</returns>
    Task<PagedResult<FamiliarDto>> GetFamiliarsAsync(Guid familyId, int page, int pageSize);

    /// <summary>
    /// Atualiza os dados de um familiar específico.
    /// </summary>
    /// <param name="familyId">Identificador único da família associada.</param>
    /// <param name="id">Identificador único do familiar.</param>
    /// <param name="request">Dados de atualização do familiar (nome e idade).</param>
    /// <returns>O DTO do familiar com as informações atualizadas.</returns>
    Task<FamiliarDto> UpdateFamiliarAsync(Guid familyId, Guid id, UpdateFamiliarRequest request);

    /// <summary>
    /// Exclui um familiar específico de uma família.
    /// </summary>
    /// <param name="familyId">Identificador único da família associada.</param>
    /// <param name="id">Identificador único do familiar.</param>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
    Task DeleteFamiliarAsync(Guid familyId, Guid id);

    /// <summary>
    /// Atualiza o nome de uma família específica.
    /// </summary>
    /// <param name="userId">Identificador único do usuário solicitante (para validação de segurança).</param>
    /// <param name="id">Identificador único da família.</param>
    /// <param name="request">Dados de atualização da família (novo nome).</param>
    /// <returns>O DTO da família com o nome atualizado.</returns>
    Task<FamilyDto> UpdateFamilyAsync(Guid userId, Guid id, UpdateFamilyRequest request);

    /// <summary>
    /// Exclui permanentemente uma família do sistema.
    /// </summary>
    /// <param name="userId">Identificador único do usuário solicitante (para validação de segurança).</param>
    /// <param name="id">Identificador único da família.</param>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
    Task DeleteFamilyAsync(Guid userId, Guid id);
}