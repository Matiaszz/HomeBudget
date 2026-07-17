using System;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Responses;

public record FamilyDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; init; }

    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;
}
