using System;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models;

public class Familiar
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Data de nascimento do familiar. Utilizada para calcular a idade em tempo de execução.
    /// </summary>
    public DateTime Birthdate { get; set; }

    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Calcula a idade atual do familiar com base na data de nascimento.
    /// </summary>
    public int CalculateAge()
    {
        var today = DateTime.Today;
        var age = today.Year - Birthdate.Year;
        if (Birthdate.Date > today.AddYears(-age))
        {
            age--;
        }
        return age;
    }
}
