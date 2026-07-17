import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, LogOut, ArrowRight, Home } from "lucide-react";

interface Family {
  id: string;
  nome: string;
}

interface FamilySelectionViewProps {
  families: Family[];
  onSelectFamily: (family: Family) => void;
  onCreateFamily: (name: string) => Promise<void>;
  loading: boolean;
  onLogout: () => void;
}

export function FamilySelectionView({
  families,
  onSelectFamily,
  onCreateFamily,
  loading,
  onLogout,
}: FamilySelectionViewProps) {
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    await onCreateFamily(newFamilyName.trim());
    setNewFamilyName("");
    setIsCreating(false);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Users className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Família de Orçamento</CardTitle>
          <CardDescription>
            Escolha uma família existente ou crie uma nova para gerenciar o orçamento doméstico.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isCreating ? (
            <>
              {/* List Families */}
              {families.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Suas Famílias
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {families.map((family) => (
                      <button
                        key={family.id}
                        onClick={() => onSelectFamily(family)}
                        className="w-full p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/70 flex items-center justify-between text-left group transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Home className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{family.nome}</p>
                          </div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl bg-muted/10">
                  <Users className="size-8 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Você ainda não pertence a nenhuma família.</p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="size-4" />
                Criar Nova Família
              </Button>
            </>
          ) : (
            /* Create Family Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="family-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Nome da Família
                </label>
                <Input
                  id="family-name"
                  placeholder="Ex: Família Silva"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setIsCreating(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading || !newFamilyName.trim()}>
                  {loading ? "Criando..." : "Criar Família"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t border-border flex justify-between">
          <Button variant="ghost" size="sm" onClick={onLogout} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" />
            Encerrar Sessão
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
