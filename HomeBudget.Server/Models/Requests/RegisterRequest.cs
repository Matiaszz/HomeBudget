using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models.Requests;

public record RegisterRequest
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [JsonPropertyName("nome")]
    public string Name { get; init; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "E-mail inválido.")]
    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "A senha deve ter pelo menos 6 caracteres.")]
    [JsonPropertyName("password")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
    [JsonPropertyName("dataNascimento")]
    public DateTime BirthDate { get; init; }
}
