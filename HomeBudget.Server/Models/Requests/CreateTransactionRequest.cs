using System;
using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

/// <summary>
/// Modelo de requisição para criar uma nova transação financeira.
/// </summary>
public record CreateTransactionRequest
{
    /// <summary>
    /// Descrição da transação.
    /// </summary>
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    public string Description = string.Empty;

    /// <summary>
    /// Valor monetário em centavos (ex: 3000 para R$ 30,00).
    /// </summary>
    [Range(1, long.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
    public long Amount { get; set; }

    /// <summary>
    /// Tipo da transação ("income" ou "expense").
    /// </summary>
    [Required(ErrorMessage = "O tipo da transação é obrigatório.")]
    [RegularExpression("^(income|expense)$", ErrorMessage = "O tipo deve ser 'income' ou 'expense'.")]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Categoria da transação (ex: Alimentação, Lazer).
    /// </summary>
    [Required(ErrorMessage = "A categoria é obrigatória.")]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Data de competência da transação.
    /// </summary>
    [Required(ErrorMessage = "A data é obrigatória.")]
    public DateTime Date { get; set; }

    /// <summary>
    /// Identificador opcional do familiar associado à transação.
    /// </summary>
    public Guid? FamiliarId { get; set; }
}
