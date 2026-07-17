import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  ChevronDown, 
  Info,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon
} from "lucide-react";
import { type Transaction, type Familiar } from "@/types";
import { formatBRL } from "@/utils/finance";

interface FamiliarReportsProps {
  familiars: Familiar[];
  transactions: Transaction[];
  onBackToDashboard: () => void;
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 280;
const SVG_PADDING = { top: 20, right: 30, bottom: 40, left: 65 };

interface DataPoint {
  label: string;
  dateKey: string;
  income: number; // em centavos
  expense: number; // em centavos
}

export function FamiliarReports({
  familiars,
  transactions,
  onBackToDashboard
}: FamiliarReportsProps) {
  // Filtros
  const [selectedFamiliarId, setSelectedFamiliarId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Tooltip do gráfico
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    yIncome: number;
    yExpense: number;
    point: DataPoint;
  } | null>(null);

  // Normaliza as datas das transações removendo a parte de hora/UTC (T00:00:00Z)
  const normalizedTransactions = useMemo(() => {
    return transactions.map(t => ({
      ...t,
      date: t.date.includes("T") ? t.date.split("T")[0] : t.date
    }));
  }, [transactions]);

  // Categorias únicas presentes
  const categories = useMemo(() => {
    const cats = new Set<string>();
    normalizedTransactions.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [normalizedTransactions]);

  // Transações filtradas
  const filteredTransactions = useMemo(() => {
    return normalizedTransactions.filter(t => {
      // Filtro de familiar
      if (selectedFamiliarId !== "all" && t.familiarId !== selectedFamiliarId) {
        return false;
      }
      // Filtro de categoria
      if (selectedCategory !== "all" && t.category !== selectedCategory) {
        return false;
      }
      // Filtro de tipo
      if (selectedType !== "all" && t.type !== selectedType) {
        return false;
      }
      // Filtro de data de início
      if (startDate && t.date < startDate) {
        return false;
      }
      // Filtro de data de fim
      if (endDate && t.date > endDate) {
        return false;
      }
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [normalizedTransactions, selectedFamiliarId, selectedCategory, selectedType, startDate, endDate]);

  // Totais das transações filtradas
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [filteredTransactions]);

  // Totais por Membro da Família (sempre calculado sobre as transações filtradas por data/categoria/tipo, mas agrupado por membro)
  const memberSummaries = useMemo(() => {
    const map = new Map<string, { name: string; income: number; expense: number }>();
    
    // Inicializa todos os membros com zero para exibição completa
    familiars.forEach(f => {
      map.set(f.id, { name: f.name, income: 0, expense: 0 });
    });

    // Agrupa transações correspondentes aos filtros (sem o filtro de membro individual para podermos comparar)
    const baseTransactionsForComparison = normalizedTransactions.filter(t => {
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false;
      if (selectedType !== "all" && t.type !== selectedType) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    baseTransactionsForComparison.forEach(t => {
      if (!t.familiarId) return;
      const current = map.get(t.familiarId) || { name: t.familiarName || "Desconhecido", income: 0, expense: 0 };
      if (t.type === "income") {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      map.set(t.familiarId, current);
    });

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    })).sort((a, b) => b.expense - a.expense); // Ordenado por quem gastou mais
  }, [familiars, normalizedTransactions, selectedCategory, selectedType, startDate, endDate]);

  // Dados para o Gráfico em Linha (SVG)
  const chartData = useMemo<DataPoint[]>(() => {
    if (filteredTransactions.length === 0) return [];

    // Determina se agrupa por mês ou por dia
    const dates = filteredTransactions.map(t => t.date);
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];

    let groupFormat: "month" | "day" = "day";
    if (minDate && maxDate) {
      const minYear = parseInt(minDate.substring(0, 4), 10);
      const minMonth = parseInt(minDate.substring(5, 7), 10);
      const maxYear = parseInt(maxDate.substring(0, 4), 10);
      const maxMonth = parseInt(maxDate.substring(5, 7), 10);
      const diffMonths = (maxYear - minYear) * 12 + (maxMonth - minMonth);
      if (diffMonths >= 1) {
        groupFormat = "month";
      }
    }

    const groups: { [key: string]: { income: number; expense: number } } = {};

    filteredTransactions.forEach(t => {
      let key = "";
      if (groupFormat === "month") {
        // YYYY-MM
        key = t.date.substring(0, 7);
      } else {
        // YYYY-MM-DD
        key = t.date;
      }

      if (!groups[key]) {
        groups[key] = { income: 0, expense: 0 };
      }

      if (t.type === "income") {
        groups[key].income += t.amount;
      } else {
        groups[key].expense += t.amount;
      }
    });

    // Ordena as chaves cronologicamente
    const sortedKeys = Object.keys(groups).sort();
    return sortedKeys.map(key => {
      // A label foi criada no loop acima
      let label = "";
      if (groupFormat === "month") {
        const [year, month] = key.split("-");
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        label = `${months[parseInt(month, 10) - 1]}/${year.substring(2)}`;
      } else {
        const parts = key.split("-");
        label = `${parts[2]}/${parts[1]}`;
      }

      return {
        dateKey: key,
        label,
        income: groups[key].income,
        expense: groups[key].expense
      };
    });
  }, [filteredTransactions]);

  const chartCoordinates = useMemo(() => {
    if (chartData.length === 0) return null;

    // Calcula o valor máximo dinamicamente baseado no tipo selecionado no filtro
    let maxVal = 0;
    if (selectedType === "income") {
      maxVal = Math.max(...chartData.map(d => d.income));
    } else if (selectedType === "expense") {
      maxVal = Math.max(...chartData.map(d => d.expense));
    } else {
      maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)));
    }

    // Valor mínimo de 100 reais (10000 centavos) para escalas pequenas/vazias
    maxVal = Math.max(maxVal, 10000);

    // Ajusta o maxVal com margem de 15% para o topo
    const adjustedMax = maxVal * 1.15;

    const points = chartData.map((d, index) => {
      const x = SVG_PADDING.left + (index / (chartData.length === 1 ? 1 : chartData.length - 1)) * (SVG_WIDTH - SVG_PADDING.left - SVG_PADDING.right);
      const yIncome = SVG_HEIGHT - SVG_PADDING.bottom - (d.income / adjustedMax) * (SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom);
      const yExpense = SVG_HEIGHT - SVG_PADDING.bottom - (d.expense / adjustedMax) * (SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom);

      return { x, yIncome, yExpense, point: d };
    });

    return {
      points,
      adjustedMax
    };
  }, [chartData, selectedType]);

  // Linhas do gráfico
  const incomePathD = useMemo(() => {
    if (!chartCoordinates || chartCoordinates.points.length === 0) return "";
    return chartCoordinates.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yIncome}`).join(" ");
  }, [chartCoordinates]);

  const expensePathD = useMemo(() => {
    if (!chartCoordinates || chartCoordinates.points.length === 0) return "";
    return chartCoordinates.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yExpense}`).join(" ");
  }, [chartCoordinates]);

  // Área preenchida sob a linha (Gradiente)
  const incomeAreaD = useMemo(() => {
    if (!chartCoordinates || chartCoordinates.points.length === 0) return "";
    const linePath = incomePathD;
    const firstPoint = chartCoordinates.points[0];
    const lastPoint = chartCoordinates.points[chartCoordinates.points.length - 1];
    const bottomY = SVG_HEIGHT - SVG_PADDING.bottom;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }, [chartCoordinates, incomePathD]);

  const expenseAreaD = useMemo(() => {
    if (!chartCoordinates || chartCoordinates.points.length === 0) return "";
    const linePath = expensePathD;
    const firstPoint = chartCoordinates.points[0];
    const lastPoint = chartCoordinates.points[chartCoordinates.points.length - 1];
    const bottomY = SVG_HEIGHT - SVG_PADDING.bottom;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }, [chartCoordinates, expensePathD]);



  // Limpa todos os filtros
  const handleClearFilters = () => {
    setSelectedFamiliarId("all");
    setSelectedCategory("all");
    setSelectedType("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 font-medium cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Consulta de Totais por Familiar
          </h1>
          <p className="text-xs text-muted-foreground">
            Filtre os membros da família e visualize a evolução orçamentária e detalhamento financeiro.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-xs">
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            {/* Familiar */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-familiar" className="text-xs font-semibold text-muted-foreground">Familiar</Label>
              <div className="relative">
                <select
                  id="filter-familiar"
                  value={selectedFamiliarId}
                  onChange={(e) => setSelectedFamiliarId(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-transparent pl-3 pr-8 py-1 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Todos os Membros</option>
                  {familiars.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
                  <ChevronDown className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-category" className="text-xs font-semibold text-muted-foreground">Categoria</Label>
              <div className="relative">
                <select
                  id="filter-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 w-full rounded-lg border bg-transparent pl-3 pr-8 py-1 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
                  <ChevronDown className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-type" className="text-xs font-semibold text-muted-foreground">Tipo</Label>
              <div className="relative">
                <select
                  id="filter-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as "all" | "income" | "expense")}
                  className="h-9 w-full rounded-lg border bg-transparent pl-3 pr-8 py-1 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-muted-foreground">
                  <ChevronDown className="size-3.5" />
                </div>
              </div>
            </div>

            {/* Data Inicial */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-start-date" className="text-xs font-semibold text-muted-foreground">Data Início</Label>
              <Input
                id="filter-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Data Final */}
            <div className="space-y-1.5">
              <Label htmlFor="filter-end-date" className="text-xs font-semibold text-muted-foreground">Data Fim</Label>
              <Input
                id="filter-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumos do Filtro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Saldo do Filtro</span>
            <DollarSign className="size-4 text-primary" />
          </div>
          <p className={`text-xl font-bold mt-2 tracking-tight ${totals.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
            {formatBRL(totals.balance)}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Receitas do Filtro</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2 tracking-tight">
            {formatBRL(totals.income)}
          </p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Despesas do Filtro</span>
            <TrendingDown className="size-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-foreground mt-2 tracking-tight">
            {formatBRL(totals.expense)}
          </p>
        </Card>
      </div>

      {/* Gráfico de Evolução Orçamentária e Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico em Linha */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              Evolução Orçamentária
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Histórico temporal de receitas vs despesas para o filtro ativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {chartData.length === 0 ? (
              <div className="h-70 flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/10 text-center p-4">
                <Info className="size-8 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">Sem dados suficientes para gerar o gráfico.</p>
                <p className="text-[10px] text-muted-foreground/80 mt-1">Tente ajustar ou limpar os filtros atuais.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Legenda do Gráfico */}
                <div className="flex items-center gap-4 text-xs font-semibold mb-3 justify-end px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Receitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Despesas</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <svg
                    width="100%"
                    height={SVG_HEIGHT}
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="overflow-visible"
                  >
                    {/* Definições de Gradientes */}
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#343434" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#343434" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    {/* Linhas de Grade e Eixo Y */}
                    {chartCoordinates &&
                      [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = SVG_PADDING.top + ratio * (SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom);
                        const val = chartCoordinates.adjustedMax * (1 - ratio);
                        return (
                          <g key={i} className="opacity-40">
                            <line
                              x1={SVG_PADDING.left}
                              y1={y}
                              x2={SVG_WIDTH - SVG_PADDING.right}
                              y2={y}
                              stroke="var(--color-border)"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={SVG_PADDING.left - 8}
                              y={y + 4}
                              textAnchor="end"
                              className="text-[9px] fill-muted-foreground font-semibold font-mono"
                            >
                              {formatBRL(val)}
                            </text>
                          </g>
                        );
                      })}

                    {/* Preenchimento de Área sob a linha */}
                    {chartCoordinates && (
                      <>
                        {selectedType !== "expense" && (
                          <path d={incomeAreaD} fill="url(#incomeGrad)" />
                        )}
                        {selectedType !== "income" && (
                          <path d={expenseAreaD} fill="url(#expenseGrad)" />
                        )}
                      </>
                    )}

                    {/* Linhas dos Gráficos */}
                    {chartCoordinates && (
                      <>
                        {selectedType !== "expense" && (
                          <path
                            d={incomePathD}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {selectedType !== "income" && (
                          <path
                            d={expensePathD}
                            fill="none"
                            stroke="#343434"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </>
                    )}

                    {/* Pontos Interativos e Rótulos do Eixo X */}
                    {chartCoordinates &&
                      chartCoordinates.points.map((p, i) => {
                        const showLabel = 
                          chartCoordinates.points.length <= 8 || 
                          i === 0 || 
                          i === chartCoordinates.points.length - 1 || 
                          i === Math.floor(chartCoordinates.points.length / 2);

                        return (
                          <g key={i}>
                            {/* Rótulo do Eixo X */}
                            {showLabel && (
                              <text
                                x={p.x}
                                y={SVG_HEIGHT - SVG_PADDING.bottom + 18}
                                textAnchor="middle"
                                className="text-[10px] fill-muted-foreground font-semibold"
                              >
                                {p.point.label}
                              </text>
                            )}

                            {/* Círculos no topo dos pontos */}
                            {selectedType !== "expense" && (
                              <circle
                                cx={p.x}
                                cy={p.yIncome}
                                r="4"
                                fill="#ffffff"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                            )}
                            {selectedType !== "income" && (
                              <circle
                                cx={p.x}
                                cy={p.yExpense}
                                r="4"
                                fill="#ffffff"
                                stroke="#343434"
                                strokeWidth="2"
                              />
                            )}

                            {/* Zona de hover invisível para tooltip mais responsivo */}
                            <rect
                              x={p.x - 15}
                              y={SVG_PADDING.top}
                              width={30}
                              height={SVG_HEIGHT - SVG_PADDING.top - SVG_PADDING.bottom}
                              fill="transparent"
                              className="cursor-crosshair"
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  x: p.x,
                                  yIncome: p.yIncome,
                                  yExpense: p.yExpense,
                                  point: p.point
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          </g>
                        );
                      })}
                  </svg>

                  {/* Tooltip Overlay Renderizado Dinamicamente */}
                  {hoveredPoint && (
                    <div
                      className="absolute p-3 rounded-lg border border-border bg-card shadow-lg text-xs space-y-1 pointer-events-none z-20 animate-in fade-in duration-100"
                      style={{
                        left: `${hoveredPoint.x}px`,
                        top: `${Math.min(hoveredPoint.yIncome, hoveredPoint.yExpense) - 85}px`,
                        transform: "translateX(-50%)"
                      }}
                    >
                      <p className="font-bold text-foreground border-b border-border/50 pb-1 mb-1">
                        Período: {hoveredPoint.point.label}
                      </p>
                      {selectedType !== "expense" && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Receita:
                          </span>
                          <span className="font-bold text-emerald-600">
                            {formatBRL(hoveredPoint.point.income)}
                          </span>
                        </div>
                      )}
                      {selectedType !== "income" && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <span className="size-2 rounded-full bg-primary" />
                            Despesa:
                          </span>
                          <span className="font-bold text-foreground">
                            {formatBRL(hoveredPoint.point.expense)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparativo de Membros da Família */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Comparativo de Membros
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Divisão individual para o período/filtros ativos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {memberSummaries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 px-4">Nenhum membro cadastrado.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {memberSummaries.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedFamiliarId(selectedFamiliarId === member.id ? "all" : member.id)}
                    className={`p-3.5 flex flex-col gap-1 transition-colors cursor-pointer hover:bg-muted/10 ${
                      selectedFamiliarId === member.id ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{member.name}</span>
                      <span className={`text-xs font-bold ${member.balance >= 0 ? "text-emerald-700" : "text-destructive"}`}>
                        {formatBRL(member.balance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 text-emerald-650 font-medium">
                        <IncomeIcon className="size-3" /> {formatBRL(member.income)}
                      </span>
                      <span className="flex items-center gap-0.5 font-medium">
                        <ExpenseIcon className="size-3 text-rose-500" /> {formatBRL(member.expense)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico Filtrado de Transações */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Transações Filtradas ({filteredTransactions.length})
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Lista detalhada correspondente aos filtros selecionados acima.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
              <p className="text-xs text-muted-foreground">Nenhuma transação atende aos critérios do filtro.</p>
            </div>
          ) : (
            <div className="divide-y divide-border border rounded-lg overflow-hidden bg-background">
              {filteredTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border ${tx.type === "income" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-muted border-border text-muted-foreground"}`}>
                      {tx.type === "income" ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{tx.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] border px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {tx.date.split("-").reverse().join("/")}
                        </span>
                        {tx.familiarName && (
                          <span className="text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
                            {tx.familiarName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === "income" ? "text-emerald-650" : "text-foreground"}`}>
                    {tx.type === "income" ? "+" : "-"} {formatBRL(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
