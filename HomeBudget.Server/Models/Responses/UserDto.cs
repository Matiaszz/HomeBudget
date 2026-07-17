using System;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Responses;

public record UserDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;

    [JsonPropertyName("dataNascimento")]
    public DateTime Birthdate { get; init; }

    [JsonPropertyName("canHaveIncome")]
    public bool CanHaveIncome { get; init; }
}
