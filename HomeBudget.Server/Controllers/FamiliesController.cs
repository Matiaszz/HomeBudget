using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Services;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Controllers;

/// <summary>
/// Controlador responsável pelas operações de gestão de famílias e membros familiares.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamiliesController(IFamilyService familyService) : ControllerBase
{
    private readonly IFamilyService _familyService = familyService;

    /// <summary>
    /// Obtém todas as famílias associadas ao usuário autenticado.
    /// </summary>
    /// <returns>Uma lista de DTOs contendo as famílias encontradas.</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FamilyDto>>>> GetUserFamilies()
    {
        var userId = GetUserId();
        var result = await _familyService.GetUserFamiliesAsync(userId);
        return Ok(ApiResponse<List<FamilyDto>>.Ok(result));
    }

    /// <summary>
    /// Cria uma nova família vinculada ao usuário autenticado.
    /// </summary>
    /// <param name="request">Dados de criação da família (nome).</param>
    /// <returns>O DTO da família criada.</returns>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<FamilyDto>>> CreateFamily(CreateFamilyRequest request)
    {
        var userId = GetUserId();
        var result = await _familyService.CreateFamilyAsync(userId, request.Name);
        return Ok(ApiResponse<FamilyDto>.Ok(result));
    }

    /// <summary>
    /// Edita o nome de uma família (apenas se pertencer ao usuário autenticado).
    /// </summary>
    /// <param name="id">Identificador único da família.</param>
    /// <param name="request">Novos dados da família (nome).</param>
    /// <returns>O DTO da família atualizada.</returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<FamilyDto>>> UpdateFamily(Guid id, UpdateFamilyRequest request)
    {
        var userId = GetUserId();
        var result = await _familyService.UpdateFamilyAsync(userId, id, request);
        return Ok(ApiResponse<FamilyDto>.Ok(result));
    }

    /// <summary>
    /// Exclui uma família permanentemente (apenas se pertencer ao usuário autenticado).
    /// </summary>
    /// <param name="id">Identificador único da família.</param>
    /// <returns>Uma resposta padrão de sucesso.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteFamily(Guid id)
    {
        var userId = GetUserId();
        await _familyService.DeleteFamilyAsync(userId, id);
        return Ok(ApiResponse.Ok());
    }

    /// <summary>
    /// Cria um novo membro (familiar) associado à família informada.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="request">Dados de criação do familiar.</param>
    /// <returns>O DTO do familiar criado.</returns>
    [HttpPost("{familyId:guid}/familiars")]
    public async Task<ActionResult<ApiResponse<FamiliarDto>>> CreateFamiliar(Guid familyId, CreateFamiliarRequest request)
    {
        var result = await _familyService.CreateFamiliarAsync(familyId, request);
        return Ok(ApiResponse<FamiliarDto>.Ok(result));
    }

    /// <summary>
    /// Obtém a lista paginada de familiares cadastrados na família informada.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="page">Número da página (1-based).</param>
    /// <param name="pageSize">Quantidade máxima de registros por página.</param>
    /// <returns>Resultado paginado dos familiares.</returns>
    [HttpGet("{familyId:guid}/familiars")]
    public async Task<ActionResult<ApiResponse<PagedResult<FamiliarDto>>>> GetFamiliars(
        Guid familyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _familyService.GetFamiliarsAsync(familyId, page, pageSize);
        return Ok(ApiResponse<PagedResult<FamiliarDto>>.Ok(result));
    }

    /// <summary>
    /// Edita os dados de um familiar existente.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="id">Identificador único do familiar.</param>
    /// <param name="request">Novos dados do familiar.</param>
    /// <returns>O DTO do familiar atualizado.</returns>
    [HttpPut("{familyId:guid}/familiars/{id:guid}")]
    public async Task<ActionResult<ApiResponse<FamiliarDto>>> UpdateFamiliar(Guid familyId, Guid id, UpdateFamiliarRequest request)
    {
        var result = await _familyService.UpdateFamiliarAsync(familyId, id, request);
        return Ok(ApiResponse<FamiliarDto>.Ok(result));
    }

    /// <summary>
    /// Exclui um familiar específico de uma família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="id">Identificador único do familiar.</param>
    /// <returns>Uma resposta padrão de sucesso.</returns>
    [HttpDelete("{familyId:guid}/familiars/{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteFamiliar(Guid familyId, Guid id)
    {
        await _familyService.DeleteFamiliarAsync(familyId, id);
        return Ok(ApiResponse.Ok());
    }

    /// <summary>
    /// Extrai o identificador único do usuário autenticado a partir das claims do token JWT.
    /// </summary>
    /// <returns>O identificador único (Guid) do usuário.</returns>
    /// <exception cref="BusinessException">Lançada se o usuário não estiver autenticado ou for inválido.</exception>
    private Guid GetUserId()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            throw new BusinessException("UNAUTHORIZED", "Usuário não autenticado ou inválido.", System.Net.HttpStatusCode.Unauthorized);
        }
        return userId;
    }
}
