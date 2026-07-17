using System;
using System.Collections.Generic;

namespace HomeBudget.Server.Models.Responses;

/// <summary>
/// DTO representando os gastos de um familiar específico.
/// </summary>
public class FamiliarExpenseDto
{
    /// <summary>
    /// Identificador do familiar.
    /// </summary>
    public Guid FamiliarId { get; set; }

    /// <summary>
    /// Nome do familiar.
    /// </summary>
    public string FamiliarName { get; set; } = string.Empty;

    /// <summary>
    /// Total de despesas gastas pelo familiar em centavos.
    /// </summary>
    public long TotalExpense { get; set; }
}

/// <summary>
/// DTO representando os gastos por categoria.
/// </summary>
public class CategoryExpenseDto
{
    /// <summary>
    /// Nome da categoria da despesa.
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Total gasto na categoria em centavos.
    /// </summary>
    public long TotalAmount { get; set; }
}

/// <summary>
/// DTO completo contendo o resumo orçamentário da família e os dados consolidados para relatórios/gráficos.
/// </summary>
public class FamilyBudgetSummaryDto
{
    /// <summary>
    /// Total consolidado de receitas em centavos.
    /// </summary>
    public long TotalIncome { get; set; }

    /// <summary>
    /// Total consolidado de despesas em centavos.
    /// </summary>
    public long TotalExpense { get; set; }

    /// <summary>
    /// Saldo líquido da família em centavos (Receitas - Despesas).
    /// </summary>
    public long NetBalance => TotalIncome - TotalExpense;

    /// <summary>
    /// Consolidação de despesas individuais de cada familiar (para gráfico "Quem gastou mais").
    /// </summary>
    public List<FamiliarExpenseDto> FamiliarExpenses { get; set; } = [];

    /// <summary>
    /// Consolidação de despesas categorizadas (para gráfico de pizza/donut).
    /// </summary>
    public List<CategoryExpenseDto> CategoryExpenses { get; set; } = [];

    /// <summary>
    /// Consolidação de totais por pessoa (receita, despesa e saldo).
    /// </summary>
    public List<FamiliarSummaryDto> FamiliarSummaries { get; set; } = [];
}

/// <summary>
/// DTO representando o resumo financeiro individual de um familiar.
/// </summary>
public class FamiliarSummaryDto
{
    /// <summary>
    /// Identificador do familiar.
    /// </summary>
    public Guid FamiliarId { get; set; }

    /// <summary>
    /// Nome do familiar.
    /// </summary>
    public string FamiliarName { get; set; } = string.Empty;

    /// <summary>
    /// Total de receitas recebidas pelo familiar em centavos.
    /// </summary>
    public long TotalIncome { get; set; }

    /// <summary>
    /// Total de despesas pagas pelo familiar em centavos.
    /// </summary>
    public long TotalExpense { get; set; }

    /// <summary>
    /// Saldo líquido do familiar em centavos (Receitas - Despesas).
    /// </summary>
    public long NetBalance => TotalIncome - TotalExpense;
}
