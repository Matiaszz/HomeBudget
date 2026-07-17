using System;
using System.Threading.Tasks;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Repositories;

// Interface para definir as operações com a entidade User
public interface IUserRepository
{
    // Obtém o usuário simples pelo ID
    Task<User?> GetByIdAsync(Guid id);

    // Obtém o usuário trazendo em conjunto a lista de famílias associadas a ele
    Task<User?> GetByIdWithFamiliesAsync(Guid id);

    // Obtém um usuário a partir do e-mail
    Task<User?> GetByEmailAsync(string email);

    // Verifica se um e-mail já existe na base
    Task<bool> EmailExistsAsync(string email);

    // Adiciona uma nova entidade User
    Task AddAsync(User user);

    // Persiste as alterações pendentes na base
    Task SaveChangesAsync();
}
