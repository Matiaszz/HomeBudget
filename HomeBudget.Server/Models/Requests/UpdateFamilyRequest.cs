using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Requests;

public record UpdateFamilyRequest
{
    [Required(ErrorMessage = "O nome da família é obrigatório.")]
    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;
}
