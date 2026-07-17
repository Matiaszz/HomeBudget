using System;

namespace HomeBudget.Server.Models.Responses;

public record FamiliarDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;

    /// <summary>Data de nascimento do Familiar.</summary>
    public DateTime Birthdate { get; init; }

    /// <summary>Age calculated at runtime from birthdate.</summary>
    public int Age { get; init; }
}
