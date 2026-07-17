using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

/// <summary>
/// Request model to update a family's name.
/// </summary>
public record UpdateFamilyRequest
{
    [Required(ErrorMessage = "O nome da família é obrigatório.")]
    public string Name { get; init; } = string.Empty;
}
