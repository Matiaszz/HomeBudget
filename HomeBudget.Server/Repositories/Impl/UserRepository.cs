using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Repositories.Impl;

// Classe concreta que implementa o repositório do usuário acessando o banco via EF Core
public class UserRepository(AppDbContext context) : IUserRepository
{
    private readonly AppDbContext _context = context;

    // Busca usuário pelo ID primário
    public async Task<User?> GetByIdAsync(Guid id) => await _context.Users.FindAsync(id);

    // Busca usuário incluindo o relacionamento Many-To-Many de famílias associadas
    public async Task<User?> GetByIdWithFamiliesAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Families)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    // Busca usuário comparando o e-mail sem distinção de caixa alta/baixa
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    // Retorna booleano se existir algum registro com o e-mail informado
    public async Task<bool> EmailExistsAsync(string email) => await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());

    // Adiciona o usuário na fila de gravação do Entity Framework
    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    // Efetiva a gravação física de todas as mudanças pendentes na base
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
