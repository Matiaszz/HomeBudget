using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Services;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Controllers;

// Controlador responsável pelas ações de autenticação (Cadastro e Login)
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // Endpoint POST: api/auth/register - Registra um novo usuário no sistema
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(ApiResponse<UserDto>.Ok(result));
    }

    // Endpoint POST: api/auth/login - Realiza login de usuário retornando token JWT e seus dados
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }
}
