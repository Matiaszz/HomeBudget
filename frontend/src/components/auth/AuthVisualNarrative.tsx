import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

export function AuthVisualNarrative() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center p-12 lg:p-20 overflow-hidden bg-gradient-to-tr from-muted/30 via-background to-muted/20 select-none">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Background soft light highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative max-w-lg mx-auto w-full z-10 flex flex-col gap-10">
        
        {/* Visual Title / Brand Intro */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out-quint">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-border text-primary text-xs font-semibold tracking-wide">
            <Layers className="size-3.5" />
            O Livro Diário Calmo
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.1] text-balance">
            Organize suas finanças com tranquilidade.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            Visualizações limpas e controle intuitivo que ajudam a eliminar a ansiedade financeira diária.
          </p>
        </div>

        {/* Mockup Dashboard Stack */}
        <div className="relative w-full aspect-[4/3] min-h-[320px] mt-2">
          
          {/* Main Balance Mock Card (Deep Charcoal) */}
          <div 
            className="absolute top-0 left-0 w-[80%] rounded-xl bg-primary text-primary-foreground border border-primary/25 p-5 shadow-lg animate-in fade-in slide-in-from-bottom-12 duration-700 delay-150 ease-out-quint fill-mode-both hover:-translate-y-1 transition-transform cursor-default"
            style={{ zIndex: 3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Wallet className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary-foreground/60 leading-none">Saldo Disponível</p>
                  <p className="text-xs font-medium text-white/90">Conta Principal</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                <ArrowUpRight className="size-3" />
                +12.4%
              </span>
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-xs font-medium text-primary-foreground/70">R$</span>
              <span className="text-3xl font-bold tracking-tight text-white">4.250,80</span>
            </div>
          </div>

          {/* Transactions List Mock Card (Pure Chalk) */}
          <div 
            className="absolute bottom-4 right-0 w-[80%] rounded-xl bg-card border border-border p-4 shadow-md animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 ease-out-quint fill-mode-both hover:-translate-y-1 transition-transform cursor-default"
            style={{ zIndex: 2 }}
          >
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-primary" />
              Atividades Recentes
            </p>
            <div className="space-y-2">
              {/* Row 1: Salário */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <ArrowUpRight className="size-3" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Salário Mensal</p>
                    <p className="text-[10px] text-muted-foreground">Trabalho</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-700">+ R$ 5.000,00</span>
              </div>
              
              {/* Row 2: Supermercado */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/5 border border-border text-muted-foreground flex items-center justify-center">
                    <ArrowDownRight className="size-3" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Supermercado</p>
                    <p className="text-[10px] text-muted-foreground">Alimentação</p>
                  </div>
                </div>
                <span className="font-bold text-foreground">- R$ 684,30</span>
              </div>
            </div>
          </div>

          {/* Decorative floating metric (Tiny indicator) */}
          <div 
            className="absolute -bottom-2 left-8 rounded-lg bg-card border border-border px-3 py-2 shadow-sm animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 ease-out-quint fill-mode-both hover:-translate-y-1 transition-transform cursor-default flex items-center gap-2.5"
            style={{ zIndex: 4 }}
          >
            <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-border">
              <DollarSign className="size-3" />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground leading-none">Meta Mensal</p>
              <p className="text-xs font-bold text-foreground mt-0.5">84% Concluída</p>
            </div>
            {/* Visual progress bar */}
            <div className="w-12 h-1.5 rounded-full bg-muted border border-border overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "84%" }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
