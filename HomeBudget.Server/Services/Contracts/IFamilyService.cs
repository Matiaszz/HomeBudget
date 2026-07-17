using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;

namespace HomeBudget.Server.Services.Contracts;

public interface IFamilyService
{
    Task<List<FamilyDto>> GetUserFamiliesAsync(Guid userId);
    Task<FamilyDto> CreateFamilyAsync(Guid userId, string familyName);
    Task<FamiliarDto> CreateFamiliarAsync(Guid familyId, CreateFamiliarRequest request);
    Task<List<FamiliarDto>> GetFamiliarsAsync(Guid familyId);
}