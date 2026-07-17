using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Repositories;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Services.Impl;

public class AuthService(IUserRepository userRepository, IConfiguration configuration) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IConfiguration _configuration = configuration;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        // 1. Verificar se o e-mail já existe
        var emailExists = await _userRepository.EmailExistsAsync(request.Email);
        if (emailExists)
        {
            throw new EmailAlreadyExistsException();
        }

        // 2. Calcular idade e validar se é de menor
        var today = DateTime.Today;
        var age = today.Year - request.BirthDate.Year;
        if (request.BirthDate.Date > today.AddYears(-age))
        {
            age--;
        }

        if (age < 18)
        {
            throw new UserUnderageException();
        }

        // 3. Criar entidade User
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Birthdate = request.BirthDate
        };

        // 4. Criptografar a senha
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        // 5. Salvar no banco
        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Birthdate = user.Birthdate,
            CanHaveIncome = user.CanHaveIncome()
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // 1. Procurar o usuário pelo e-mail
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new InvalidCredentialsException();
        }

        // 2. Verificar a senha
        var passwordResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new InvalidCredentialsException();
        }

        // 3. Gerar o token JWT
        var token = GenerateJwtToken(user);

        return new LoginResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Birthdate = user.Birthdate,
                CanHaveIncome = user.CanHaveIncome()
            }
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Secret") ?? throw new InvalidOperationException("JWT Secret not configured"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("CanHaveIncome", user.CanHaveIncome().ToString().ToLower())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = jwtSettings.GetValue<string>("Issuer"),
            Audience = jwtSettings.GetValue<string>("Audience"),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
