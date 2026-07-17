import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  X,
  PieChart,
  BarChart3,
  User,
  ChevronDown,
  ShieldAlert
} from "lucide-react";
import { type Familiar } from "@/components/family/FamiliarsManager";

export interface UserDto {
  id: string;
  nome: string;
  email: string;
  dataNascimento: string;
  canHaveIncome: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Em centavos
  type: "income" | "expense";
  category: string;
  date: string;
  familiarId?: string;
  familiarName?: string;
  lastIncomeRegister: number; // Em centavos
  lastExpenseRegister: number; // Em centavos
}

interface TransactionsManagerProps {
  user: UserDto;
  transactions: Transaction[];
  familiars: Familiar[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    familiarExpenses: { familiarId: string; familiarName: string; totalExpense: number }[];
    categoryExpenses: { category: string; totalAmount: number }[];
  } | null;
  onAddTransaction: (tx: { 
    description: string; 
    amount: number; // Em centavos
    type: "income" | "expense"; 
    category: string; 
    date: string; 
    familiarId?: string; 
  }) => Promise<void>;
}

export function TransactionsManager({
  user,
  transactions,
  familiars,
  summary,
  onAddTransaction,
}: TransactionsManagerProps) {
  // Controle de abertura do modal flutuante de transação
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do formulário de transação
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txCategory, setTxCategory] = useState("Alimentação");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txFamiliarId, setTxFamiliarId] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription || !txAmount || !txDate) return;

    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (txDate > todayStr) {
      alert("A data da transação não pode ser posterior a hoje.");
      return;
    }

    const finalType = user.canHaveIncome ? txType : "expense";
    if (finalType === "expense" && !txFamiliarId) {
      alert("Selecione o familiar responsável pela despesa.");
      return;
    }

    // Converte o valor de Real para Centavos
    const amountCents = Math.round(amountNum * 100);

    await onAddTransaction({
      description: txDescription,
      amount: amountCents,
      type: finalType,
      category: txCategory,
      date: txDate,
      familiarId: txFamiliarId
    });

    // Limpa os campos do formulário
    setTxDescription("");
    setTxAmount("");
    setTxFamiliarId("");
    setIsModalOpen(false);
  };

  // Auxiliar para formatação de data legível
  const formatDate = (dateStr: string) => {
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  // Valores dinâmicos performáticos vindos da consolidação do backend
  const totalIncomesBrl = summary ? summary.totalIncome / 100 : 0;
  const totalExpensesBrl = summary ? summary.totalExpense / 100 : 0;
  const netBalanceBrl = summary ? summary.netBalance / 100 : 0;

  // Cálculo de dados para os gráficos
  const maxFamiliarExpense = summary && summary.familiarExpenses.length > 0
    ? Math.max(...summary.familiarExpenses.map(f => f.totalExpense))
    : 0;

  const maxCategoryExpense = summary && summary.categoryExpenses.length > 0
    ? Math.max(...summary.categoryExpenses.map(c => c.totalAmount))
    : 0;

  // Cores personalizadas para categorias de despesas
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Alimentação": return "bg-amber-500";
      case "Moradia": return "bg-blue-500";
      case "Transporte": return "bg-indigo-500";
      case "Lazer": return "bg-emerald-500";
      case "Trabalho": return "bg-teal-500";
      default: return "bg-slate-400";
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case "Alimentação": return "border-amber-500/20 text-amber-600 bg-amber-500/5";
      case "Moradia": return "border-blue-500/20 text-blue-600 bg-blue-500/5";
      case "Transporte": return "border-indigo-500/20 text-indigo-600 bg-indigo-500/5";
      case "Lazer": return "border-emerald-500/20 text-emerald-600 bg-emerald-500/5";
      case "Trabalho": return "border-teal-500/20 text-teal-600 bg-teal-500/5";
      default: return "border-slate-500/20 text-slate-600 bg-slate-500/5";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cards de Resumos Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Atual</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className={`text-2xl font-bold mt-2 tracking-tight ${netBalanceBrl >= 0 ? "text-foreground" : "text-destructive"}`}>
            {netBalanceBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receitas</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 tracking-tight">
            {totalIncomesBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Despesas</span>
            <TrendingDown className="size-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
            {totalExpensesBrl.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Card>
      </div>

      {/* Seção de Relatórios e Gráficos */}
      {summary && (summary.familiarExpenses.length > 0 || summary.categoryExpenses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gráfico/Indicador: Quem Gastou Mais (Familiar) */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                Despesas por Familiar
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Consolidado de gastos individuais dos membros da família.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.familiarExpenses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem gastos individuais registrados.</p>
              ) : (
                [...summary.familiarExpenses]
                  .sort((a, b) => b.totalExpense - a.totalExpense)
                  .map((f) => {
                    const pctOfMax = maxFamiliarExpense > 0 ? (f.totalExpense / maxFamiliarExpense) * 100 : 0;
                    const pctOfTotal = summary.totalExpense > 0 ? (f.totalExpense / summary.totalExpense) * 100 : 0;
                    return (
                      <div key={f.familiarId} className="space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <span className="size-2 rounded-full bg-primary" />
                            {f.familiarName}
                          </span>
                          <span className="text-muted-foreground">
                            {(f.totalExpense / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ({pctOfTotal.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary/80 rounded-full transition-all duration-500" 
                            style={{ width: `${pctOfMax}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>

          {/* Gráfico/Indicador: Gastos por Categoria */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <PieChart className="size-4 text-emerald-500" />
                Despesas por Categoria
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Proporção de consumo em cada categoria do Ledger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.categoryExpenses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sem categorias de despesas registradas.</p>
              ) : (
                summary.categoryExpenses
                  .sort((a,b) => b.totalAmount - a.totalAmount)
                  .map((c) => {
                    const pctOfMax = maxCategoryExpense > 0 ? (c.totalAmount / maxCategoryExpense) * 100 : 0;
                    const pctOfTotal = summary.totalExpense > 0 ? (c.totalAmount / summary.totalExpense) * 100 : 0;
                    return (
                      <div key={c.category} className="space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-foreground">{c.category}</span>
                          <span className="text-muted-foreground">
                            {(c.totalAmount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ({pctOfTotal.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getCategoryColor(c.category)} rounded-full transition-all duration-500`}
                            style={{ width: `${pctOfMax}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* Floating Action Button (Botão Flutuante "+") */}
      <Button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40 hover:shadow-primary/30"
        title="Nova Transação"
      >
        <Plus className="size-6" />
      </Button>

      {/* Modal Overlay / Form (Adicionar Transação) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 relative border-b border-border/40">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </Button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Plus className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-foreground">
                    Nova Transação
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Adicione uma movimentação ao seu orçamento.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Selector Segmentado de Tipo */}
                <div className="space-y-1.5">
                  <Label>Tipo de Transação</Label>
                  {user.canHaveIncome ? (
                    <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setTxType("expense");
                          setTxFamiliarId("");
                        }}
                        className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          txType === "expense"
                            ? "bg-background text-foreground shadow-sm border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Despesa
                      </button>
                      <button
                        type="button"
                        onClick={() => setTxType("income")}
                        className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          txType === "income"
                            ? "bg-background text-foreground shadow-sm border border-border/50"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Receita
                      </button>
                    </div>
                  ) : (
                    <div className="py-2 px-3 rounded-lg border border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center gap-2">
                      <ShieldAlert className="size-3.5 text-muted-foreground" />
                      <span>Registrando Despesa (receita bloqueada para menores)</span>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label htmlFor="tx-desc">Descrição</Label>
                  <Input
                    id="tx-desc"
                    type="text"
                    placeholder="Ex: Aluguel, Supermercado..."
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-1.5">
                  <Label htmlFor="tx-amount">Valor</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm font-semibold text-muted-foreground">R$</span>
                    <Input
                      id="tx-amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      required
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Categoria e Data Lado a Lado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-cat">Categoria</Label>
                    <div className="relative">
                      <select
                        id="tx-cat"
                        value={txCategory}
                        className="h-9 w-full rounded-lg border bg-transparent pl-3 pr-8 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all appearance-none cursor-pointer"
                        onChange={(e) => setTxCategory(e.target.value)}
                      >
                        <option value="Alimentação" className="bg-card">Alimentação</option>
                        <option value="Moradia" className="bg-card">Moradia</option>
                        <option value="Transporte" className="bg-card">Transporte</option>
                        <option value="Lazer" className="bg-card">Lazer</option>
                        {user.canHaveIncome && <option value="Trabalho" className="bg-card">Trabalho</option>}
                        <option value="Outros" className="bg-card">Outros</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
                        <ChevronDown className="size-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tx-date">Data</Label>
                    <div className="relative flex items-center">
                      <Input
                        id="tx-date"
                        type="date"
                        max={todayStr}
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        required
                        className="h-9 text-sm pr-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Familiar Responsável (Apenas se for Despesa) */}
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="tx-familiar">Familiar Responsável</Label>
                  <div className="relative">
                    <select
                      id="tx-familiar"
                      value={txFamiliarId}
                      onChange={(e) => setTxFamiliarId(e.target.value)}
                      required
                      className="h-9 w-full rounded-lg border bg-transparent pl-3 pr-8 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-muted-foreground">
                        Selecione o familiar...
                      </option>
                      {familiars.map((f) => (
                        <option key={f.id} value={f.id} className="text-foreground bg-card">
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
                      <ChevronDown className="size-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/30 border-t border-border/40 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Adicionar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Histórico de Transaçõe */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Transações
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Suas últimas movimentações ordenadas por data de registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">Nenhuma transação registrada ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border border rounded-lg overflow-hidden bg-background">
              {transactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${tx.type === "income" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-muted border-border text-muted-foreground"}`}>
                      {tx.type === "income" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className={`text-[10px] border px-1.5 py-0.5 rounded font-medium ${getCategoryBorderColor(tx.category)}`}>
                          {tx.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                        {tx.familiarName && (
                          <span className="text-[10px] font-semibold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <User className="size-2.5" />
                            {tx.familiarName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-foreground"}`}>
                      {tx.type === "income" ? "+" : "-"} {(tx.amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Saldo: {((tx.lastIncomeRegister - tx.lastExpenseRegister) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
