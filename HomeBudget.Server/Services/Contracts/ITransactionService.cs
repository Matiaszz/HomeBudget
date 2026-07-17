using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;

namespace HomeBudget.Server.Services.Contracts;

/// <summary>
/// Interface contendo o contrato de negócio de operações relacionadas a transações financeiras.
/// </summary>
public interface ITransactionService
{
    /// <summary>
    /// Registra uma nova transação financeira e recalcula o saldo/histórico do livro caixa.
    /// </summary>
    /// <param name="familyId">Identificador único da família associada.</param>
    /// <param name="request">Dados de criação da transação.</param>
    /// <returns>DTO da transação criada com saldos acumulados preenchidos.</returns>
    Task<TransactionDto> CreateTransactionAsync(Guid familyId, CreateTransactionRequest request);

    /// <summary>
    /// Retorna o histórico completo de transações de uma família, ordenado por data descendente (mais recentes primeiro).
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>Lista de DTOs das transações.</returns>
    Task<List<TransactionDto>> GetTransactionsAsync(Guid familyId);

    /// <summary>
    /// Obtém o resumo consolidado contendo totais e gastos consolidados por familiar e categoria.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>O DTO contendo os totais consolidado e os dados para gráficos.</returns>
    Task<FamilyBudgetSummaryDto> GetBudgetSummaryAsync(Guid familyId);
}
