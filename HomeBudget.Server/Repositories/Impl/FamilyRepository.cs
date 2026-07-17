using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Repositories;

public class FamilyRepository : IFamilyRepository
{
    private readonly AppDbContext _context;

    public FamilyRepository(AppDbContext context)
    {
        _context = context;
    }

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

        return user?.Families.ToList() ?? new List<Family>();
    }

    public async Task AddFamilyAsync(Family family)
    {
        await _context.Families.AddAsync(family);
    }

    public async Task AddFamiliarAsync(Familiar familiar)
    {
        await _context.Familiars.AddAsync(familiar);
    }

    public async Task<List<Familiar>> GetFamiliarsAsync(Guid familyId)
    {
        return await _context.Familiars
            .Where(f => f.FamilyId == familyId)
            .ToListAsync();
    }

    public async Task<Family?> GetFamilyByIdAsync(Guid id)
    {
        return await _context.Families.FindAsync(id);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
