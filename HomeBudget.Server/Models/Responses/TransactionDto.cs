using System;

namespace HomeBudget.Server.Models.Responses;

/// <summary>
/// Modelo de resposta contendo os dados estruturados de uma transação do Ledger.
/// </summary>
public class TransactionDto
{
    /// <summary>
    /// Identificador único da transação.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Identificador único da família associada.
    /// </summary>
    public Guid FamilyId { get; set; }

    /// <summary>
    /// Identificador do familiar associado.
    /// </summary>
    public Guid? FamiliarId { get; set; }

    /// <summary>
    /// Nome do familiar associado (nulo caso não tenha).
    /// </summary>
    public string? FamiliarName { get; set; }

    /// <summary>
    /// Descrição da transação.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Valor monetário da transação em centavos.
    /// </summary>
    public long Amount { get; set; }

    /// <summary>
    /// Tipo da transação ("income" ou "expense").
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Categoria da transação.
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Data de competência.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Receita acumulada após esta transação.
    /// </summary>
    public long LastIncomeRegister { get; set; }

    /// <summary>
    /// Despesa acumulada após esta transação.
    /// </summary>
    public long LastExpenseRegister { get; set; }

    /// <summary>
    /// Saldo acumulado após esta transação (receita acumulada - despesa acumulada).
    /// </summary>
    public long BalanceAfter => LastIncomeRegister - LastExpenseRegister;
}
