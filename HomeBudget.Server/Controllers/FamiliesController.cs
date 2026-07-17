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

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamiliesController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FamilyDto>>>> GetUserFamilies()
    {
        var userId = GetUserId();
        var result = await _familyService.GetUserFamiliesAsync(userId);
        return Ok(ApiResponse<List<FamilyDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<FamilyDto>>> CreateFamily(CreateFamilyRequest request)
    {
        var userId = GetUserId();
        var result = await _familyService.CreateFamilyAsync(userId, request.Name);
        return Ok(ApiResponse<FamilyDto>.Ok(result));
    }

    // Edita o nome de uma família (apenas se pertencer ao usuário autenticado)
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<FamilyDto>>> UpdateFamily(Guid id, UpdateFamilyRequest request)
    {
        var userId = GetUserId();
        var result = await _familyService.UpdateFamilyAsync(userId, id, request);
        return Ok(ApiResponse<FamilyDto>.Ok(result));
    }

    // Exclui uma família (apenas se pertencer ao usuário autenticado)
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteFamily(Guid id)
    {
        var userId = GetUserId();
        await _familyService.DeleteFamilyAsync(userId, id);
        return Ok(ApiResponse.Ok());
    }

    // Cria um novo membro (familiar) associado à família
    [HttpPost("{familyId:guid}/familiars")]
    public async Task<ActionResult<ApiResponse<FamiliarDto>>> CreateFamiliar(Guid familyId, CreateFamiliarRequest request)
    {
        var result = await _familyService.CreateFamiliarAsync(familyId, request);
        return Ok(ApiResponse<FamiliarDto>.Ok(result));
    }

    // Obtém a lista paginada de familiares cadastrados na família
    [HttpGet("{familyId:guid}/familiars")]
    public async Task<ActionResult<ApiResponse<PagedResult<FamiliarDto>>>> GetFamiliars(
        Guid familyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _familyService.GetFamiliarsAsync(familyId, page, pageSize);
        return Ok(ApiResponse<PagedResult<FamiliarDto>>.Ok(result));
    }

    // Edita os dados de um familiar existente
    [HttpPut("{familyId:guid}/familiars/{id:guid}")]
    public async Task<ActionResult<ApiResponse<FamiliarDto>>> UpdateFamiliar(Guid familyId, Guid id, UpdateFamiliarRequest request)
    {
        var result = await _familyService.UpdateFamiliarAsync(familyId, id, request);
        return Ok(ApiResponse<FamiliarDto>.Ok(result));
    }

    // Exclui um familiar específico da família
    [HttpDelete("{familyId:guid}/familiars/{id:guid}")]
    public async Task<ActionResult<ApiResponse>> DeleteFamiliar(Guid familyId, Guid id)
    {
        await _familyService.DeleteFamiliarAsync(familyId, id);
        return Ok(ApiResponse.Ok());
    }

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
