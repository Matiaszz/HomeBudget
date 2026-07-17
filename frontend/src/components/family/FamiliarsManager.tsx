import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, UserCheck } from "lucide-react";

export interface Familiar {
  id: string;
  nome: string;
  idade: number;
}

interface FamiliarsManagerProps {
  familiars: Familiar[];
  onCreateFamiliar: (nome: string, idade: number) => Promise<void>;
  loading: boolean;
}

export function FamiliarsManager({ familiars, onCreateFamiliar, loading }: FamiliarsManagerProps) {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !idade) return;
    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 0) return;
    await onCreateFamiliar(nome.trim(), idadeNum);
    setNome("");
    setIdade("");
    setIsAdding(false);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Users className="size-5 text-primary" />
          Membros da Família
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Membros registrados nesta família (não são usuários).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {familiars.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {familiars.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserCheck className="size-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{f.nome}</p>
                    <p className="text-xs text-muted-foreground">{f.idade} {f.idade === 1 ? 'ano' : 'anos'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/10">
            <p className="text-sm font-medium text-muted-foreground">Nenhum membro cadastrado.</p>
          </div>
        )}

        {!isAdding ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsAdding(true)}
            disabled={loading}
          >
            <Plus className="size-4" />
            Adicionar Membro
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 p-3 border border-border rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <label htmlFor="fam-name" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Nome
              </label>
              <Input
                id="fam-name"
                placeholder="Nome do familiar"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fam-age" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Idade
              </label>
              <Input
                id="fam-age"
                type="number"
                min="0"
                max="150"
                placeholder="Idade do familiar"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                disabled={loading}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => setIsAdding(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={loading || !nome.trim() || !idade}>
                Salvar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
