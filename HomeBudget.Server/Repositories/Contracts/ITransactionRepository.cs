using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Repositories.Contracts;

/// <summary>
/// Interface contendo os contratos de persistência da entidade Transaction.
/// </summary>
public interface ITransactionRepository
{
    /// <summary>
    /// Busca uma transação por ID.
    /// </summary>
    /// <param name="id">Identificador único da transação.</param>
    /// <returns>A entidade correspondente ou null.</returns>
    Task<Transaction?> GetByIdAsync(Guid id);

    /// <summary>
    /// Obtém todas as transações de uma família específica.
    /// Inclui o familiar associado.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>Uma lista contendo as transações encontradas.</returns>
    Task<List<Transaction>> GetByFamilyIdAsync(Guid familyId);

    /// <summary>
    /// Insere uma nova transação.
    /// </summary>
    /// <param name="transaction">A entidade a ser adicionada.</param>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
    Task AddAsync(Transaction transaction);

    /// <summary>
    /// Calcula o resumo orçamentário consolidado e agrupado da família.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>O DTO completo de resumo com os acumulados em centavos.</returns>
    Task<HomeBudget.Server.Models.Responses.FamilyBudgetSummaryDto> GetBudgetSummaryAsync(Guid familyId);

    /// <summary>
    /// Persiste as alterações pendentes no banco.
    /// </summary>
    /// <returns>Uma Task representando a operação assíncrona.</returns>
    Task SaveChangesAsync();
}
