using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Controllers;

/// <summary>
/// Controlador responsável pelas transações financeiras de uma família específica.
/// </summary>
[ApiController]
[Route("api/families/{familyId:guid}/[controller]")]
[Authorize]
public class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    private readonly ITransactionService _transactionService = transactionService;


    /// <summary>
    /// Cria uma nova transação financeira para a família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="request">Modelo de dados de criação da transação.</param>
    /// <returns>A transação criada contendo o saldo atualizado.</returns>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> CreateTransaction(Guid familyId, CreateTransactionRequest request)
    {
        var result = await _transactionService.CreateTransactionAsync(familyId, request);
        return Ok(ApiResponse<TransactionDto>.Ok(result));
    }

    /// <summary>
    /// Obtém o histórico completo de transações da família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>A listagem contendo as transações.</returns>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetTransactions(Guid familyId)
    {
        var result = await _transactionService.GetTransactionsAsync(familyId);
        return Ok(ApiResponse<List<TransactionDto>>.Ok(result));
    }

    /// <summary>
    /// Obtém o resumo consolidado contendo os totais de orçamento e agrupados para os gráficos.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>O resumo consolidado do orçamento.</returns>
    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<FamilyBudgetSummaryDto>>> GetBudgetSummary(Guid familyId)
    {
        var result = await _transactionService.GetBudgetSummaryAsync(familyId);
        return Ok(ApiResponse<FamilyBudgetSummaryDto>.Ok(result));
    }
}
