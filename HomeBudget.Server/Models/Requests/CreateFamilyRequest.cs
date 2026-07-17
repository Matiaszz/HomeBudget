using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

public record CreateFamilyRequest
{
    [Required(ErrorMessage = "O nome da família é obrigatório.")]
    public string Name { get; init; } = string.Empty;
}
