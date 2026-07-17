using System;

namespace HomeBudget.Server.Models.Responses;

public record UserDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTime Birthdate { get; init; }
    public bool CanHaveIncome { get; init; }
}
