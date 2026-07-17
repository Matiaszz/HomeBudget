using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;

namespace HomeBudget.Server.Services.Contracts;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
