using System;

namespace HomeBudget.Server.Models.Responses;

public record FamilyDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
