using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using HomeBudget.Server.Data;
using HomeBudget.Server.Models;
using HomeBudget.Server.Repositories.Contracts;
using HomeBudget.Server.Models.Responses;

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
    public async Task<FamilyBudgetSummaryDto> GetBudgetSummaryAsync(Guid familyId)
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
            .Select(g => new FamiliarExpenseDto
            {
                FamiliarId = g.Key.FamiliarId!.Value,
                FamiliarName = g.Key.Name,
                TotalExpense = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        var categoryExpenses = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.Type == "expense")
            .GroupBy(t => t.Category)
            .Select(g => new CategoryExpenseDto
            {
                Category = g.Key,
                TotalAmount = g.Sum(t => t.Amount)
            })
            .ToListAsync();

        // Buscar familiares para fazer left-join em memória e incluir os de total zero
        var familiarsList = await _context.Familiars
            .Where(f => f.FamilyId == familyId)
            .Select(f => new { f.Id, f.Name })
            .ToListAsync();

        var transactionsGrouped = await _context.Transactions
            .Where(t => t.FamilyId == familyId && t.FamiliarId != null)
            .GroupBy(t => t.FamiliarId)
            .Select(g => new
            {
                FamiliarId = g.Key!.Value,
                TotalIncome = g.Where(t => t.Type == "income").Sum(t => t.Amount),
                TotalExpense = g.Where(t => t.Type == "expense").Sum(t => t.Amount)
            })
            .ToListAsync();

        var familiarSummaries = familiarsList.Select(f =>
        {
            var txSum = transactionsGrouped.FirstOrDefault(tg => tg.FamiliarId == f.Id);
            return new FamiliarSummaryDto
            {
                FamiliarId = f.Id,
                FamiliarName = f.Name,
                TotalIncome = txSum?.TotalIncome ?? 0,
                TotalExpense = txSum?.TotalExpense ?? 0
            };
        }).ToList();

        return new FamilyBudgetSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            FamiliarExpenses = familiarExpenses,
            CategoryExpenses = categoryExpenses,
            FamiliarSummaries = familiarSummaries
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
