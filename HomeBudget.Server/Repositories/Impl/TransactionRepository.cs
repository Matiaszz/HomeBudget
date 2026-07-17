using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;
using HomeBudget.Server.Repositories.Contracts;

namespace HomeBudget.Server.Repositories.Impl;

/// <summary>
/// Repositório concreto para persistência de transações financeiras utilizando Entity Framework Core.
/// </summary>
public class TransactionRepository(AppDbContext context) : ITransactionRepository
{
    private readonly AppDbContext _context = context;

    /// <summary>
    /// Busca uma transação pelo ID incluindo o familiar associado.
    /// </summary>
    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _context.Transactions
            .Include(t => t.Familiar)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    /// <summary>
    /// Retorna a lista completa de transações de uma família específica, incluindo seus familiares.
    /// </summary>
    public async Task<List<Transaction>> GetByFamilyIdAsync(Guid familyId)
    {
        return await _context.Transactions
            .Include(t => t.Familiar)
            .Where(t => t.FamilyId == familyId)
            .ToListAsync();
    }

    /// <summary>
    /// Adiciona a transação no Entity Framework.
    /// </summary>
    public async Task AddAsync(Transaction transaction)
    {
        await _context.Transactions.AddAsync(transaction);
    }

    /// <summary>
    /// Calcula o resumo orçamentário consolidado e agrupado da família.
    /// </summary>
    public async Task<HomeBudget.Server.Models.Responses.FamilyBudgetSummaryDto> GetBudgetSummaryAsync(Guid familyId)
    {
        var totalIncome = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.Type == "income")
            .SumAsync(t => (long?)t.Amount) ?? 0;

        var totalExpense = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.Type == "expense")
            .SumAsync(t => (long?)t.Amount) ?? 0;

        var familiarExpenses = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.Type == "expense" && t.FamiliarId != null)
            .GroupBy(t => new { t.FamiliarId, t.Familiar!.Name })
            .Select(g => new HomeBudget.Server.Models.Responses.FamiliarExpenseDto
            {
                FamiliarId = g.Key.FamiliarId!.Value,
                FamiliarName = g.Key.Name,
                TotalExpense = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        var categoryExpenses = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.Type == "expense")
            .GroupBy(t => t.Category)
            .Select(g => new HomeBudget.Server.Models.Responses.CategoryExpenseDto
            {
                Category = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        return new HomeBudget.Server.Models.Responses.FamilyBudgetSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            FamiliarExpenses = familiarExpenses,
            CategoryExpenses = categoryExpenses
        };
    }

    /// <summary>
    /// Persiste as alterações no banco de dados.
    /// </summary>
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
