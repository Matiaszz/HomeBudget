namespace HomeBudget.Server.Models.Responses;

public record LoginResponse
{
    public string Token { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}
