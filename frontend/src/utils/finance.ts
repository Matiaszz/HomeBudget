import { type Transaction, type FamilyBudgetSummaryDto } from "@/types";

/**
 * Formats a financial value in cents to a BRL currency string.
 * E.g. 150050 -> "R$ 1.500,50"
 * @param cents The amount in cents.
 */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formats a raw input text into a masked BRL currency input value.
 * E.g. "1500" -> "15,00"
 * @param value The raw string input from user.
 */
export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Returns the local date string formatted as YYYY-MM-DD.
 * Used for date picker inputs and timezone-safe date parsing.
 * @param d The date instance (defaults to current date).
 */
export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Recalculates the family budget summary locally from a list of transactions.
 * Used to avoid expensive backend roundtrips when items are deleted client-side.
 * @param txs List of active transactions.
 */
export function recalculateSummary(txs: Transaction[]): FamilyBudgetSummaryDto {
  const totalIncome = txs
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txs
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const familiarExpensesMap = new Map<string, { name: string; total: number }>();
  const categoryExpensesMap = new Map<string, number>();
  const familiarSummariesMap = new Map<string, { name: string; income: number; expense: number }>();

  txs.forEach((t) => {
    const fid = t.familiarId || "unknown";
    const fname = t.familiarName || "Desconhecido";

    if (t.type === "expense") {
      // Aggregate category expenses
      categoryExpensesMap.set(
        t.category,
        (categoryExpensesMap.get(t.category) || 0) + t.amount
      );
      // Aggregate individual expenses
      if (t.familiarId) {
        const current = familiarExpensesMap.get(fid) || { name: fname, total: 0 };
        familiarExpensesMap.set(fid, { name: fname, total: current.total + t.amount });
      }
    }

    // Aggregate summaries per member (income vs expense)
    if (t.familiarId) {
      const current = familiarSummariesMap.get(fid) || { name: fname, income: 0, expense: 0 };
      if (t.type === "income") {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      familiarSummariesMap.set(fid, current);
    }
  });

  const familiarExpenses = Array.from(familiarExpensesMap.entries()).map(([id, data]) => ({
    familiarId: id,
    familiarName: data.name,
    totalExpense: data.total,
  }));

  const categoryExpenses = Array.from(categoryExpensesMap.entries()).map(([cat, total]) => ({
    category: cat,
    totalAmount: total,
  }));

  const familiarSummaries = Array.from(familiarSummariesMap.entries()).map(([id, data]) => ({
    familiarId: id,
    familiarName: data.name,
    totalIncome: data.income,
    totalExpense: data.expense,
    netBalance: data.income - data.expense,
  }));

  return {
    totalIncome,
    totalExpense,
    netBalance,
    familiarExpenses,
    categoryExpenses,
    familiarSummaries,
  };
}
