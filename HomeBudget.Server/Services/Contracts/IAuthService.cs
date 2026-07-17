using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;

namespace HomeBudget.Server.Services.Contracts;

/// <summary>
/// Interface contendo o contrato de negócio para autenticação e registro de usuários.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Cadastra um novo usuário no banco de dados com senha hasheada de forma segura.
    /// </summary>
    /// <param name="request">Dados de cadastro do usuário (nome, e-mail, senha, data de nascimento).</param>
    /// <returns>O DTO do usuário cadastrado.</returns>
    Task<UserDto> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Autentica um usuário por meio de suas credenciais de e-mail e senha.
    /// </summary>
    /// <param name="request">Dados de login contendo e-mail e senha.</param>
    /// <returns>A resposta de login contendo os dados do usuário e o token JWT assinado.</returns>
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
