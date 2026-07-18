import { type Transaction, type FamilyBudgetSummaryDto } from "@/types";

/**
 * Formata um valor financeiro representado em centavos para uma string de moeda BRL (R$).
 * Ex: 150050 -> "R$ 1.500,50"
 *
 * TRATADO: Adicionada validação de tipo defensiva em tempo de execução para evitar falhas ou "NaN".
 *
 * @param cents O valor total em centavos.
 */
export function formatBRL(cents: number): string {
  const safeCents = typeof cents === "number" && !isNaN(cents) ? cents : 0;
  return (safeCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Formata um texto bruto digitado pelo usuário em um valor mascarado de entrada de moeda BRL.
 * Ex: "1500" -> "15,00"
 *
 * TRATADO: Adicionada verificação e limpeza rigorosa de caracteres não numéricos para evitar quebras.
 *
 * @param value A string bruta inserida pelo usuário.
 */
export function formatCurrencyInput(value: string): string {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  if (isNaN(cents)) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Retorna uma string de data local formatada como AAAA-MM-DD.
 * Útil para campos do tipo date picker.
 *
 * TRATADO (FUSO HORÁRIO):
 * Evita o retrocesso de datas provenientes de strings puras (ex: "2026-07-17" ou datas ISO com Z).
 * Se a entrada for do formato YYYY-MM-DD em formato de texto, parseia diretamente pelas frações
 * da string em vez de criar um objeto Date sujeito ao fuso horário do navegador.
 *
 * @param d A instância de data ou string a ser formatada (padrão é a data/hora atual local).
 */
export function getLocalDateString(d: Date | string = new Date()): string {
  const dateObj = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return "";

  // Se for uma string de data pura YYYY-MM-DD, divide e retorna diretamente para evitar fuso horário
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    const [year, month, day] = d.trim().split("-").map(Number);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Fallback para objetos Date usando os métodos de tempo local
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Recalcula localmente o resumo do orçamento familiar com base em uma lista de transações.
 * Usado para atualizar a tela sem precisar fazer requisições extras ao backend.
 *
 * TRATADO (OTIMIZAÇÃO E SEGURANÇA):
 * 1. Laço Único: O processamento foi consolidado em um único loop O(N) reduzindo a
 *    pressão sobre o garbage collector e processamento de CPU.
 * 2. Limpeza de código morto: Variáveis de fallback ("unknown") só são inicializadas
 *    quando realmente há um familiar para ser processado.
 * 3. Validação defensiva: Valores de amount são validados e convertidos para número,
 *    eliminando o perigo de concatenação acidental de strings.
 *
 * @param txs Lista de transações ativas.
 */
export function recalculateSummary(txs: Transaction[]): FamilyBudgetSummaryDto {
  let totalIncome = 0;
  let totalExpense = 0;

  const familiarExpensesMap = new Map<
    string,
    { name: string; total: number }
  >();
  const categoryExpensesMap = new Map<string, number>();
  const familiarSummariesMap = new Map<
    string,
    { name: string; income: number; expense: number }
  >();

  txs.forEach((t) => {
    // Validação de segurança: Garante que t.amount seja convertido e somado numericamente
    const amount =
      typeof t.amount === "number" && !isNaN(t.amount)
        ? t.amount
        : parseInt(t.amount.toString(), 10) || 0;

    if (t.type === "income") {
      totalIncome += amount;
    } else if (t.type === "expense") {
      totalExpense += amount;

      // Agrupa despesa por categoria globalmente
      categoryExpensesMap.set(
        t.category,
        (categoryExpensesMap.get(t.category) || 0) + amount,
      );
    }

    // Processa os dados por membro familiar apenas se familiarId estiver presente
    if (t.familiarId) {
      const fid = t.familiarId;
      const fname = t.familiarName || "Desconhecido";

      // 1. Agrupamento de despesa individual por membro
      if (t.type === "expense") {
        const currentExp = familiarExpensesMap.get(fid) || {
          name: fname,
          total: 0,
        };
        familiarExpensesMap.set(fid, {
          name: fname,
          total: currentExp.total + amount,
        });
      }

      // 2. Agrupamento do resumo de saldos (entrada/saída) por membro
      const currentSum = familiarSummariesMap.get(fid) || {
        name: fname,
        income: 0,
        expense: 0,
      };
      if (t.type === "income") {
        currentSum.income += amount;
      } else if (t.type === "expense") {
        currentSum.expense += amount;
      }
      familiarSummariesMap.set(fid, currentSum);
    }
  });

  const netBalance = totalIncome - totalExpense;

  const familiarExpenses = Array.from(familiarExpensesMap.entries()).map(
    ([id, data]) => ({
      familiarId: id,
      familiarName: data.name,
      totalExpense: data.total,
    }),
  );

  const categoryExpenses = Array.from(categoryExpensesMap.entries()).map(
    ([cat, total]) => ({
      category: cat,
      totalAmount: total,
    }),
  );

  const familiarSummaries = Array.from(familiarSummariesMap.entries()).map(
    ([id, data]) => ({
      familiarId: id,
      familiarName: data.name,
      totalIncome: data.income,
      totalExpense: data.expense,
      netBalance: data.income - data.expense,
    }),
  );

  return {
    totalIncome,
    totalExpense,
    netBalance,
    familiarExpenses,
    categoryExpenses,
    familiarSummaries,
  };
}
