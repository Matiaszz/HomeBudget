using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Requests;

/// <summary>
/// Modelo de requisição para atualizar os dados de um familiar existente.
/// </summary>
public record UpdateFamiliarRequest
{
    /// <summary>
    /// Novo nome do familiar. Campo obrigatório.
    /// </summary>
    [Required(ErrorMessage = "O nome do familiar é obrigatório.")]
    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Nova idade do familiar. Deve estar entre 0 e 150.
    /// </summary>
    [Required(ErrorMessage = "A idade do familiar é obrigatória.")]
    [Range(0, 150, ErrorMessage = "A idade deve ser um valor válido.")]
    [JsonPropertyName("idade")]
    public int Age { get; init; }
}
