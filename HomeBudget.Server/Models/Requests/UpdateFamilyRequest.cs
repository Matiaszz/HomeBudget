using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Requests;

/// <summary>
/// Modelo de requisição para atualizar os dados (nome) de uma família.
/// </summary>
public record UpdateFamilyRequest
{
    /// <summary>
    /// Novo nome atribuído à família. Campo obrigatório.
    /// </summary>
    [Required(ErrorMessage = "O nome da família é obrigatório.")]
    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;
}
