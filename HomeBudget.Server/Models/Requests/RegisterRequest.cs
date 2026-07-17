using System.ComponentModel.DataAnnotations;

namespace HomeBudget.Server.Models.Requests;

public record RegisterRequest
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "A senha deve ter pelo menos 6 caracteres.")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
    public DateTime BirthDate { get; init; }
}
