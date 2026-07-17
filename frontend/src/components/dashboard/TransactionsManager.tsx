import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign 
} from "lucide-react";

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
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

interface TransactionsManagerProps {
  user: UserDto;
  transactions: Transaction[];
  onAddTransaction: (tx: { description: string; amount: number; type: "income" | "expense"; category: string; date: string }) => void;
}

export function TransactionsManager({
  user,
  transactions,
  onAddTransaction,
}: TransactionsManagerProps) {
  // Transaction form states
  const [txDescription, setTxDescription] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txCategory, setTxCategory] = useState("Alimentação");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription || !txAmount || !txDate) return;

    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    // Check age permission
    const finalType = user.canHaveIncome ? txType : "expense";

    onAddTransaction({
      description: txDescription,
      amount: amountNum,
      type: finalType,
      category: txCategory,
      date: txDate,
    });

    // Reset inputs
    setTxDescription("");
    setTxAmount("");
  };

  // Format Date ISO helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Totals calculations
  const totalIncomes = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncomes - totalExpenses;

  return (
    <div className="lg:col-span-2 space-y-6">
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Saldo</span>
            <DollarSign className="size-4 text-muted-foreground" />
          </div>
          <p className={`text-lg font-bold mt-2 ${netBalance >= 0 ? "text-foreground" : "text-destructive"}`}>
            R$ {netBalance.toFixed(2)}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Receitas</span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-800 mt-2">
            R$ {totalIncomes.toFixed(2)}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Despesas</span>
            <TrendingDown className="size-4 text-destructive" />
          </div>
          <p className="text-lg font-bold text-foreground mt-2">
            R$ {totalExpenses.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Add Transaction Form */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Nova Transação
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Adicione uma movimentação financeira ao seu orçamento.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tx-desc">Descrição</Label>
              <Input
                id="tx-desc"
                type="text"
                placeholder="Ex: Aluguel, Supermercado..."
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Valor (R$)</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-type">Tipo</Label>
              {user.canHaveIncome ? (
                <select
                  id="tx-type"
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as "income" | "expense")}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              ) : (
                <div className="h-8 w-full rounded-lg border border-input bg-muted/40 px-2 flex items-center text-xs text-muted-foreground">
                  Despesa (receita bloqueada para menores)
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-cat">Categoria</Label>
              <select
                id="tx-cat"
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Alimentação">Alimentação</option>
                <option value="Moradia">Moradia</option>
                <option value="Transporte">Transporte</option>
                <option value="Lazer">Lazer</option>
                {user.canHaveIncome && <option value="Trabalho">Trabalho</option>}
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tx-date">Data</Label>
              <Input
                id="tx-date"
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-2">
            <Button type="submit">
              Adicionar Transação
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Transactions List */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Histórico de Transações
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
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-background">
              {transactions.slice(0, 10).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3.5 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${tx.type === "income" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-muted border-border text-muted-foreground"}`}>
                      {tx.type === "income" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground">{tx.category}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-800" : "text-foreground"}`}>
                      {tx.type === "income" ? "+" : "-"} R$ {tx.amount.toFixed(2)}
                    </span>
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
