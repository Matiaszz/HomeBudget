using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

public record CreateFamiliarRequest
{
    [Required(ErrorMessage = "O nome do familiar é obrigatório.")]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Data de nascimento do Familiar. Deve ser no passado; não pode exceder 150 anos.
    /// </summary>
    [Required(ErrorMessage = "A data de nascimento do familiar é obrigatória.")]
    public DateTime Birthdate { get; init; }
}
