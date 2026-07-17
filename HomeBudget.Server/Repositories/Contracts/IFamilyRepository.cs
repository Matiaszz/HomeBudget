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
    Task<List<Familiar>> GetFamiliarsAsync(Guid familyId);
    Task<Family?> GetFamilyByIdAsync(Guid id);
    Task SaveChangesAsync();
}
