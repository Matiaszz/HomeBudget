using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

/// <summary>
/// Request model to update an existing family member's data.
/// </summary>
public record UpdateFamiliarRequest
{
    /// <summary>New name of the family member. Required.</summary>
    [Required(ErrorMessage = "O nome do familiar é obrigatório.")]
    public string Name { get; init; } = string.Empty;

    /// <summary>New date of birth. Must be a valid past date.</summary>
    [Required(ErrorMessage = "A data de nascimento do familiar é obrigatória.")]
    public DateTime Birthdate { get; init; }
}
