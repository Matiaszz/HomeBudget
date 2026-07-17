using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Services;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Controllers;

/// <summary>
/// Controlador responsável pelas ações de autenticação (Cadastro e Login).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    /// <summary>
    /// Endpoint POST: api/auth/register - Registra um novo usuário no sistema após validações.
    /// </summary>
    /// <param name="request">Dados para cadastro do novo usuário.</param>
    /// <returns>O DTO do usuário cadastrado.</returns>
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(ApiResponse<UserDto>.Ok(result));
    }

    /// <summary>
    /// Endpoint POST: api/auth/login - Realiza a autenticação do usuário retornando o token JWT e seus dados.
    /// </summary>
    /// <param name="request">Credenciais de login contendo e-mail e senha.</param>
    /// <returns>A resposta de login contendo o token de acesso e os dados básicos do usuário.</returns>
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }
}
