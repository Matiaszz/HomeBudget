using System;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models;

/// <summary>
/// Entidade que representa uma transação financeira no Livro Caixa (Ledger).
/// </summary>
public class Transaction
{
    /// <summary>
    /// Identificador único da transação.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Identificador único da família associada.
    /// </summary>
    public Guid FamilyId { get; set; }

    /// <summary>
    /// Entidade da família proprietária da transação.
    /// </summary>
    [JsonIgnore]
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Identificador do familiar que realizou a transação (opcional, ex: para despesas).
    /// </summary>
    public Guid? FamiliarId { get; set; }

    /// <summary>
    /// Entidade do familiar que realizou a transação (opcional).
    /// </summary>
    public Familiar? Familiar { get; set; }

    /// <summary>
    /// Descrição/Detalhamento da transação.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Valor monetário da transação em centavos.
    /// </summary>
    public long Amount { get; set; }

    /// <summary>
    /// Tipo da transação ("income" para receitas, "expense" para despesas).
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Categoria da transação (ex: Alimentação, Lazer, etc.).
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Data de competência da transação.
    /// </summary>
    public DateTime Date { get; set; }

}
