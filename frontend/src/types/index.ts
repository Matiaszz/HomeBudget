/**
 * Shared Type Definitions for the HomeBudget Application.
 */

export interface UserDto {
  id: string;
  name: string;
  email: string;
  birthdate: string;
  canHaveIncome: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Stored in cents (e.g. 100 = R$ 1.00)
  type: "income" | "expense";
  category: string;
  date: string; // YYYY-MM-DD
  familiarId?: string;
  familiarName?: string;
  lastIncomeRegister: number; // Running balance income total in cents
  lastExpenseRegister: number; // Running balance expense total in cents
}

export interface Familiar {
  id: string;
  name: string;
  age: number;
  birthdate: string; // ISO date string from API
}

export interface Family {
  id: string;
  name: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FamiliarExpenseDto {
  familiarId: string;
  familiarName: string;
  totalExpense: number; // in cents
}

export interface CategoryExpenseDto {
  category: string;
  totalAmount: number; // in cents
}

export interface FamiliarSummaryDto {
  familiarId: string;
  familiarName: string;
  totalIncome: number; // in cents
  totalExpense: number; // in cents
  netBalance: number; // in cents
}

export interface FamilyBudgetSummaryDto {
  totalIncome: number; // in cents
  totalExpense: number; // in cents
  netBalance: number; // in cents
  familiarExpenses: FamiliarExpenseDto[];
  categoryExpenses: CategoryExpenseDto[];
  familiarSummaries: FamiliarSummaryDto[];
}
