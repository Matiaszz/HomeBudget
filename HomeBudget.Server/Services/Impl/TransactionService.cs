using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeBudget.Server.Exceptions;
using HomeBudget.Server.Models;
using HomeBudget.Server.Models.Requests;
using HomeBudget.Server.Models.Responses;
using HomeBudget.Server.Repositories.Contracts;
using HomeBudget.Server.Services.Contracts;

namespace HomeBudget.Server.Services.Impl;

/// <summary>
/// Implementação concreta do serviço de transações e controle de saldo acumulado (Ledger) em memória.
/// </summary>
public class TransactionService(
    ITransactionRepository transactionRepository,
    IFamilyRepository familyRepository) : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository = transactionRepository;
    private readonly IFamilyRepository _familyRepository = familyRepository;

    /// <summary>
    /// Insere uma nova transação financeira no banco, valida regras de data e associa familiar, retornando a transação com saldos calculados.
    /// </summary>
    /// <param name="familyId">Identificador único da família associada.</param>
    /// <param name="request">Dados de criação da transação.</param>
    /// <returns>DTO da transação criada com saldos acumulados em memória.</returns>
    public async Task<TransactionDto> CreateTransactionAsync(Guid familyId, CreateTransactionRequest request)
    {
        // 1. Validar se a família alvo existe
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Validar se o familiar informado pertence à família
        if (!request.FamiliarId.HasValue)
        {
            throw new BusinessException("FAMILIAR_REQUIRED", "O familiar responsável é obrigatório.");
        }

        var familiarObj = await _familyRepository.GetFamiliarByIdAsync(request.FamiliarId.Value);
        if (familiarObj == null || familiarObj.FamilyId != familyId)
        {
            throw new BusinessException("FAMILIAR_NOT_FOUND", "Familiar não encontrado ou não pertence a esta família.");
        }

        if (request.Type == "income" && familiarObj.CalculateAge() < 18)
        {
            throw new BusinessException("FAMILIAR_UNDERAGE", "O responsável por uma receita deve ter 18 anos ou mais.");
        }

        // 3. Validar se a data da transação é futura (com tolerância de 1 dia para diferenças de fuso horário)
        if (request.Date.Date > DateTime.Today.AddDays(1))
        {
            throw new BusinessException("INVALID_DATE", "A data da transação não pode ser posterior a hoje.");
        }

        // 4. Instanciar a transação com data no padrão UTC para compatibilidade PostgreSQL
        var transaction = new Transaction
        {
            FamilyId = familyId,
            FamiliarId = request.FamiliarId,
            Description = request.Description,
            Amount = request.Amount,
            Type = request.Type,
            Category = request.Category,
            Date = DateTime.SpecifyKind(request.Date, DateTimeKind.Utc)
        };

        // 5. Adicionar a transação no banco (gravação rápida O(1))
        await _transactionRepository.AddAsync(transaction);
        await _transactionRepository.SaveChangesAsync();

        // 6. Recalcular o ledger acumulado em memória para retornar no DTO
        var allTxs = await _transactionRepository.GetByFamilyIdAsync(familyId);
        var calculatedDtos = CalculateLedger(allTxs);

        return calculatedDtos.First(t => t.Id == transaction.Id);
    }

    /// <summary>
    /// Retorna o histórico de transações da família ordenado por data e ID descrescentes.
    /// Os saldos acumulados (ledger) são calculados em memória no momento da requisição.
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>Lista de DTOs das transações com saldos.</returns>
    public async Task<List<TransactionDto>> GetTransactionsAsync(Guid familyId)
    {
        // 1. Validar se a família alvo existe
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Buscar as transações
        var transactions = await _transactionRepository.GetByFamilyIdAsync(familyId);

        // 3. Calcular ledger acumulado em memória
        var calculatedDtos = CalculateLedger(transactions);

        // 4. Retornar ordenado de forma decrescente (mais recente primeiro)
        return calculatedDtos
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToList();
    }

    /// <summary>
    /// Obtém o resumo orçamentário consolidado e agrupado da família (utilizando consultas SQL otimizadas SUM/GROUP BY).
    /// </summary>
    /// <param name="familyId">Identificador único da família.</param>
    /// <returns>DTO contendo os totais de orçamento e consolidados para gráficos.</returns>
    public async Task<FamilyBudgetSummaryDto> GetBudgetSummaryAsync(Guid familyId)
    {
        // 1. Validar se a família alvo existe
        var family = await _familyRepository.GetFamilyByIdAsync(familyId);
        if (family == null)
        {
            throw new BusinessException("FAMILY_NOT_FOUND", "Família não encontrada.");
        }

        // 2. Retornar resumo calculado otimizado do repositório
        return await _transactionRepository.GetBudgetSummaryAsync(familyId);
    }

    /// <summary>
    /// Método privado auxiliar para calcular sequencialmente em memória os saldos acumulados do Ledger.
    /// </summary>
    private static List<TransactionDto> CalculateLedger(List<Transaction> transactions)
    {
        // Ordenar cronologicamente (do mais antigo para o mais recente) para calcular o saldo acumulado
        var ordered = transactions
            .OrderBy(t => t.Date)
            .ThenBy(t => t.Id)
            .ToList();

        long runningIncome = 0;
        long runningExpense = 0;
        var dtos = new List<TransactionDto>();

        foreach (var tx in ordered)
        {
            if (tx.Type == "income")
            {
                runningIncome += tx.Amount;
            }
            else if (tx.Type == "expense")
            {
                runningExpense += tx.Amount;
            }

            dtos.Add(new TransactionDto
            {
                Id = tx.Id,
                FamilyId = tx.FamilyId,
                FamiliarId = tx.FamiliarId,
                FamiliarName = tx.Familiar?.Name,
                Description = tx.Description,
                Amount = tx.Amount,
                Type = tx.Type,
                Category = tx.Category,
                Date = tx.Date,
                LastIncomeRegister = runningIncome,
                LastExpenseRegister = runningExpense
            });
        }

        return dtos;
    }
}
