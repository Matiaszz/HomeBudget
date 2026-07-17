using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;
using HomeBudget.Server.Repositories.Contracts;

namespace HomeBudget.Server.Repositories.Impl;

/// <summary>
/// Repositório concreto para persistência e consultas relacionadas a Famílias e Familiares no EF Core.
/// </summary>
public class FamilyRepository(AppDbContext context) : IFamilyRepository
{
    private readonly AppDbContext _context = context;

    /// <summary>
    /// Busca uma família pelo ID incluindo a lista completa de seus familiares associados.
    /// </summary>
    /// <param name="id">Identificador único da família.</param>
    /// <returns>A entidade Family com familiares ou null se não encontrada.</returns>
    public async Task<Family?> GetByIdWithFamiliarsAsync(Guid id)
    {
        return await _context.Families
            .Include(f => f.Familiars)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    /// <summary>
    /// Obtém todas as famílias associadas a um usuário específico.
    /// </summary>
    /// <param name="userId">Identificador único do usuário.</param>
    /// <returns>Uma lista contendo as famílias vinculadas ao usuário.</returns>
    public async Task<List<Family>> GetUserFamiliesAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Families)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.Families.ToList() ?? [];
    }

    /// <summary>
    /// Adiciona uma nova família ao contexto do Entity Framework.
    /// </summary>
    /// <param name="family">Entidade da família a ser inserida.</param>
    public async Task AddFamilyAsync(Family family)
    {
        await _context.Families.AddAsync(family);
    }

    /// <summary>
    /// Adiciona um novo membro familiar ao contexto do Entity Framework.
    /// </summary>
    /// <param name="familiar">Entidade do familiar a ser inserida.</param>
    public async Task AddFamiliarAsync(Familiar familiar)
    {
        await _context.Familiars.AddAsync(familiar);
    }

    /// <summary>
    /// Busca a listagem paginada de familiares pertencentes a uma família específica e calcula a contagem total.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <param name="page">Número da página solicitado.</param>
    /// <param name="pageSize">Quantidade de registros por página.</param>
    /// <returns>Uma tupla contendo a lista dos familiares e a contagem total de registros na base.</returns>
    public async Task<(List<Familiar> Items, int TotalCount)> GetFamiliarsPaginatedAsync(Guid familyId, int page, int pageSize)
    {
        var query = _context.Familiars.Where(f => f.FamilyId == familyId);
        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(f => f.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    /// <summary>
    /// Busca uma família simples por seu identificador único.
    /// </summary>
    /// <param name="id">Identificador da família.</param>
    /// <returns>A entidade Family ou null.</returns>
    public async Task<Family?> GetFamilyByIdAsync(Guid id)
    {
        return await _context.Families.FindAsync(id);
    }

    /// <summary>
    /// Busca um familiar simples por seu identificador único.
    /// </summary>
    /// <param name="id">Identificador do familiar.</param>
    /// <returns>A entidade Familiar ou null.</returns>
    public async Task<Familiar?> GetFamiliarByIdAsync(Guid id)
    {
        return await _context.Familiars.FindAsync(id);
    }

    /// <summary>
    /// Remove um familiar do contexto (exclusão lógica e física ao persistir).
    /// </summary>
    /// <param name="familiar">Entidade do familiar a ser removida.</param>
    public void DeleteFamiliar(Familiar familiar)
    {
        _context.Familiars.Remove(familiar);
    }

    /// <summary>
    /// Remove uma família do contexto (exclusão lógica e física ao persistir).
    /// </summary>
    /// <param name="family">Entidade da família a ser removida.</param>
    public void DeleteFamily(Family family)
    {
        _context.Families.Remove(family);
    }

    /// <summary>
    /// Grava todas as alterações pendentes no banco de dados físico (Unit of Work).
    /// </summary>
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
