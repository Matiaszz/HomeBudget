/**
 * Definições de Tipos Compartilhadas para a Aplicação HomeBudget.
 */

/**
 * DTO que representa o usuário autenticado.
 */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  birthdate: string; // Formato de data vindo da API
  canHaveIncome: boolean; // Indica se o usuário pode cadastrar receitas (maior de 18 anos)
}

/**
 * Representa uma transação financeira (Receita ou Despesa).
 * 
 * NOTA DE DESIGN/FRAGILIDADE:
 * 1. O campo `amount` armazena o valor em centavos para evitar imprecisões matemáticas com ponto flutuante em JS.
 *    Qualquer cálculo ou exibição exige divisão ou multiplicação por 100.
 * 2. O campo `date` vem formatado como `YYYY-MM-DD`. Cuidado ao instanciar `new Date(date)` diretamente, 
 *    pois o JS interpretará como UTC meia-noite e poderá mudar o dia conforme o fuso horário local do navegador.
 */
export interface Transaction {
  id: string;
  description: string;
  amount: number; // Armazenado em centavos (ex: 100 = R$ 1,00)
  type: "income" | "expense";
  category: string;
  date: string; // Formato YYYY-MM-DD (sujeito a bugs de fuso horário se parseado incorretamente)
  familiarId?: string; // ID opcional do familiar associado
  familiarName?: string; // Nome opcional do familiar
  lastIncomeRegister: number; // Saldo acumulado de receitas em centavos até esta transação
  lastExpenseRegister: number; // Saldo acumulado de despesas em centavos até esta transação
}

/**
 * Representa um familiar cadastrado no grupo familiar.
 * 
 * ALERTA DE DESIGN DE MODELAGEM:
 * O campo `age` (idade) é retornado de forma estática do backend ou armazenado. 
 * Calcular a idade de forma estática no backend/banco de dados é uma má prática, pois ela muda a cada ano.
 * Idealmente, a idade deve ser calculada dinamicamente no frontend a partir do campo `birthdate`.
 */
export interface Familiar {
  id: string;
  name: string;
  age: number; // Armazenado estaticamente (fragilidade de design)
  birthdate: string; // String de data ISO vinda da API
}

/**
 * Representa o grupo familiar do usuário.
 */
export interface Family {
  id: string;
  name: string;
}

/**
 * Estrutura genérica para respostas paginadas do backend.
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * DTO que consolida o gasto total de um familiar específico.
 */
export interface FamiliarExpenseDto {
  familiarId: string;
  familiarName: string;
  totalExpense: number; // em centavos
}

/**
 * DTO que consolida o total gasto em uma determinada categoria de despesa.
 */
export interface CategoryExpenseDto {
  category: string;
  totalAmount: number; // em centavos
}

/**
 * Resumo financeiro consolidado por familiar.
 */
export interface FamiliarSummaryDto {
  familiarId: string;
  familiarName: string;
  totalIncome: number; // em centavos
  totalExpense: number; // em centavos
  netBalance: number; // em centavos
}

/**
 * Resumo consolidado do orçamento familiar completo.
 */
export interface FamilyBudgetSummaryDto {
  totalIncome: number; // em centavos
  totalExpense: number; // em centavos
  netBalance: number; // em centavos
  familiarExpenses: FamiliarExpenseDto[];
  categoryExpenses: CategoryExpenseDto[];
  familiarSummaries: FamiliarSummaryDto[];
}
