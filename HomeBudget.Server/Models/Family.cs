using System;
using System.Collections.Generic;

namespace HomeBudget.Server.Models;

public class Family
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = [];
    public ICollection<Familiar> Familiars { get; set; } = [];
}
