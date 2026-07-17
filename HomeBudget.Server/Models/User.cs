using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime Birthdate { get; set; }

    [JsonIgnore]
    public ICollection<Family> Families { get; set; } = [];

    public bool CanHaveIncome()
    {
        var today = DateTime.Today;
        var age = today.Year - Birthdate.Year;
        if (Birthdate.Date > today.AddYears(-age))
        {
            age--;
        }
        return age >= 18;
    }
}
