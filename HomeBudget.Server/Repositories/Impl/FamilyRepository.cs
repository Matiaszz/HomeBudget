using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;
using HomeBudget.Server.Repositories.Contracts;

namespace HomeBudget.Server.Repositories.Impl;

public class FamilyRepository(AppDbContext context) : IFamilyRepository
{
    private readonly AppDbContext _context = context;

    public async Task<Family?> GetByIdWithFamiliarsAsync(Guid id)
    {
        return await _context.Families
            .Include(f => f.Familiars)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<List<Family>> GetUserFamiliesAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Families)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return user?.Families.ToList() ?? [];
    }

    public async Task AddFamilyAsync(Family family)
    {
        await _context.Families.AddAsync(family);
    }

    public async Task AddFamiliarAsync(Familiar familiar)
    {
        await _context.Familiars.AddAsync(familiar);
    }

    // Busca a lista paginada de familiares da família e calcula o total geral
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

    // Busca uma família pelo ID
    public async Task<Family?> GetFamilyByIdAsync(Guid id)
    {
        return await _context.Families.FindAsync(id);
    }

    // Busca um familiar pelo ID
    public async Task<Familiar?> GetFamiliarByIdAsync(Guid id)
    {
        return await _context.Familiars.FindAsync(id);
    }

    // Marca um familiar para ser excluído do banco de dados
    public void DeleteFamiliar(Familiar familiar)
    {
        _context.Familiars.Remove(familiar);
    }

    // Marca uma família para ser excluída do banco de dados
    public void DeleteFamily(Family family)
    {
        _context.Families.Remove(family);
    }

    // Grava todas as alterações pendentes no banco de dados (EF Core unit of work)
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
