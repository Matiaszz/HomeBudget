using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeBudget.Server.Models;

namespace HomeBudget.Server.Repositories;

public interface IFamilyRepository
{
    Task<Family?> GetByIdWithFamiliarsAsync(Guid id);
    Task<List<Family>> GetUserFamiliesAsync(Guid userId);
    Task AddFamilyAsync(Family family);
    Task AddFamiliarAsync(Familiar familiar);
    Task<(List<Familiar> Items, int TotalCount)> GetFamiliarsPaginatedAsync(Guid familyId, int page, int pageSize);
    Task<Family?> GetFamilyByIdAsync(Guid id);
    Task<Familiar?> GetFamiliarByIdAsync(Guid id);
    void DeleteFamiliar(Familiar familiar);
    void DeleteFamily(Family family);
    Task SaveChangesAsync();
}
