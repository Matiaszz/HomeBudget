using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;
using HomeBudget.Server.Repositories.Contracts;

namespace HomeBudget.Server.Repositories.Impl;

/// <summary>
/// Classe concreta que implementa o repositório do usuário acessando o banco via EF Core.
/// </summary>
public class UserRepository(AppDbContext context) : IUserRepository
{
    private readonly AppDbContext _context = context;

    /// <summary>
    /// Busca um usuário por seu identificador único.
    /// </summary>
    /// <param name="id">Identificador do usuário.</param>
    /// <returns>A entidade User ou null se não encontrada.</returns>
    public async Task<User?> GetByIdAsync(Guid id) => await _context.Users.FindAsync(id);

    /// <summary>
    /// Busca um usuário pelo ID, incluindo o relacionamento Many-To-Many de famílias associadas.
    /// </summary>
    /// <param name="id">Identificador do usuário.</param>
    /// <returns>A entidade User com a lista de famílias carregada ou null.</returns>
    public async Task<User?> GetByIdWithFamiliesAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Families)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    /// <summary>
    /// Busca um usuário comparando o e-mail de forma case-insensitive.
    /// </summary>
    /// <param name="email">Endereço de e-mail do usuário.</param>
    /// <returns>A entidade User correspondente ou null.</returns>
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    /// <summary>
    /// Verifica se já existe algum usuário cadastrado com o e-mail informado (verificação case-insensitive).
    /// </summary>
    /// <param name="email">Endereço de e-mail a verificar.</param>
    /// <returns>True se o e-mail já existir, senão false.</returns>
    public async Task<bool> EmailExistsAsync(string email) => await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());

    /// <summary>
    /// Adiciona um novo usuário ao contexto do Entity Framework para gravação futura.
    /// </summary>
    /// <param name="user">Entidade de usuário a ser criada.</param>
    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    /// <summary>
    /// Grava fisicamente todas as alterações de usuários pendentes na base de dados.
    /// </summary>
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
