using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Requests;

public record CreateFamiliarRequest
{
    [Required(ErrorMessage = "O nome do familiar é obrigatório.")]
    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "A idade do familiar é obrigatória.")]
    [Range(0, 150, ErrorMessage = "A idade deve ser um valor válido.")]
    [JsonPropertyName("idade")]
    public int Age { get; init; }
}
