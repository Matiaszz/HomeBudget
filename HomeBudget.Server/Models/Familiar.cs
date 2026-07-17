using System;
using System.Text.Json.Serialization;

namespace HomeBudget.Server.Models;

public class Familiar
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }

    public Guid FamilyId { get; set; }
    [JsonIgnore]
    public Family Family { get; set; } = null!;
}
