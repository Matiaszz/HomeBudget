import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  User, 
  Sparkles
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function AuthVisualNarrative() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center p-8 lg:p-12 overflow-hidden bg-linear-to-tr from-muted/30 via-background to-muted/20 select-none">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-bg-size-[3.5rem_3.5rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Background soft light highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative max-w-lg mx-auto w-full z-10 flex flex-col gap-8">
        
        {/* Visual Title / Brand Intro */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out-quint">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-border text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="size-3.5" />
            O Orçamento Calmo
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-[1.15] text-balance">
            Visualizações limpas para suas finanças familiares.
          </h2>
          <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed text-pretty">
            Monitore gastos por membro, consulte relatórios dinâmicos e reduza o estresse financeiro.
          </p>
        </div>

        {/* Dashboard Mockup Grid - Aligned with actual App UI */}
        <div className="border border-border rounded-xl bg-card shadow-xl overflow-hidden p-4 space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 ease-out-quint fill-mode-both hover:-translate-y-1 transition-transform cursor-default">
          
          {/* Mock Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Logo className="size-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground leading-none">HomeBudget</span>
                <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">Família Silva</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="px-2 py-0.5 rounded bg-muted text-[9px] font-semibold text-foreground">Dashboard</div>
              <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-semibold text-primary">Relatórios</div>
            </div>
          </div>

          {/* Cards de Resumos Financeiros */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-border bg-card p-2 rounded-lg relative overflow-hidden">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Saldo</span>
              <p className="text-sm font-bold mt-1 text-foreground">R$ 3.840,00</p>
            </div>
            <div className="border border-border bg-card p-2 rounded-lg">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Receitas</span>
              <p className="text-sm font-bold mt-1 text-emerald-600">R$ 5.000,00</p>
            </div>
            <div className="border border-border bg-card p-2 rounded-lg">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Despesas</span>
              <p className="text-sm font-bold mt-1 text-foreground">R$ 1.160,00</p>
            </div>
          </div>

          {/* Seção Principal Split: Gráfico e Transações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mock Mini SVG Line Chart */}
            <div className="border border-border rounded-lg bg-card p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  Evolução
                </span>
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="size-1.5 rounded-full bg-primary" />
                </div>
              </div>
              
              {/* Mini SVG representation of the line chart */}
              <div className="w-full h-20 pt-1">
                <svg width="100%" height="100%" viewBox="0 0 100 45" className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="5" x2="100" y2="5" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                  <line x1="0" y1="35" x2="100" y2="35" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
                  
                  {/* Income Area Fill */}
                  <path d="M 0 40 L 0 5 L 25 10 L 50 8 L 75 12 L 100 5 L 100 40 Z" fill="#10b981" fillOpacity="0.08" />
                  {/* Expense Area Fill */}
                  <path d="M 0 40 L 0 35 L 25 32 L 50 18 L 75 28 L 100 30 L 100 40 Z" fill="#343434" fillOpacity="0.04" />
                  
                  {/* Income Line */}
                  <path d="M 0 5 L 25 10 L 50 8 L 75 12 L 100 5" fill="none" stroke="#10b981" strokeWidth="1" />
                  <circle cx="50" cy="8" r="1.5" fill="#ffffff" stroke="#10b981" strokeWidth="0.75" />
                  <circle cx="100" cy="5" r="1.5" fill="#ffffff" stroke="#10b981" strokeWidth="0.75" />

                  {/* Expense Line */}
                  <path d="M 0 35 L 25 32 L 50 18 L 75 28 L 100 30" fill="none" stroke="#343434" strokeWidth="1" />
                  <circle cx="50" cy="18" r="1.5" fill="#ffffff" stroke="#343434" strokeWidth="0.75" />
                  <circle cx="100" cy="30" r="1.5" fill="#ffffff" stroke="#343434" strokeWidth="0.75" />
                </svg>
              </div>
              <div className="flex justify-between text-[7px] text-muted-foreground font-mono">
                <span>Jan/26</span>
                <span>Jun/26</span>
              </div>
            </div>

            {/* Mock Mini Transactions */}
            <div className="border border-border rounded-lg bg-card p-2.5 space-y-2">
              <span className="text-[9px] font-bold text-foreground block">Atividades</span>
              <div className="space-y-1.5">
                {/* Transaction 1 */}
                <div className="flex items-center justify-between text-[9px] leading-tight">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-muted border border-border text-muted-foreground">
                      <TrendingDown className="size-2.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Aluguel</p>
                      <div className="flex gap-1 items-center mt-0.5">
                        <span className="text-[6px] border border-blue-500/20 text-blue-600 bg-blue-500/5 px-1 py-0.2 rounded font-medium">Moradia</span>
                        <span className="text-[7px] text-primary/70 font-semibold bg-primary/5 px-1 py-0.2 rounded">Rodrigo</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">- R$ 740,00</span>
                </div>

                {/* Transaction 2 */}
                <div className="flex items-center justify-between text-[9px] leading-tight">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                      <TrendingUp className="size-2.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Salário</p>
                      <div className="flex gap-1 items-center mt-0.5">
                        <span className="text-[6px] border border-teal-500/20 text-teal-600 bg-teal-500/5 px-1 py-0.2 rounded font-medium">Trabalho</span>
                        <span className="text-[7px] text-primary/70 font-semibold bg-primary/5 px-1 py-0.2 rounded">Mariana</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-650">+ R$ 5.000,00</span>
                </div>
              </div>
            </div>

          </div>

          {/* Mock Family Members Comparison */}
          <div className="border border-border rounded-lg bg-muted/20 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-primary" />
              <span className="text-[9px] font-bold text-foreground">Membros Responsáveis</span>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-[8px] bg-card border border-border px-1.5 py-0.5 rounded">
                <User className="size-2.5 text-primary" />
                <span className="font-semibold text-foreground">Mariana</span>
                <span className="text-[7px] text-emerald-700 font-bold">+R$ 5.000,00</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] bg-card border border-border px-1.5 py-0.5 rounded">
                <User className="size-2.5 text-primary" />
                <span className="font-semibold text-foreground">Rodrigo</span>
                <span className="text-[7px] text-destructive font-bold">-R$ 740,00</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
