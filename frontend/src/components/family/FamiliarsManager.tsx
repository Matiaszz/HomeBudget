import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, UserCheck, Pencil, Trash, Check, X } from "lucide-react";

export interface Familiar {
  id: string;
  nome: string;
  idade: number;
}

interface FamiliarsManagerProps {
  familiars: Familiar[];
  onCreateFamiliar: (nome: string, idade: number) => Promise<void>;
  onUpdateFamiliar: (id: string, nome: string, idade: number) => Promise<void>;
  onDeleteFamiliar: (id: string) => Promise<void>;
  loading: boolean;
}

export function FamiliarsManager({
  familiars,
  onCreateFamiliar,
  onUpdateFamiliar,
  onDeleteFamiliar,
  loading,
}: FamiliarsManagerProps) {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editIdade, setEditIdade] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleStartEdit = (f: Familiar) => {
    setEditingId(f.id);
    setEditNome(f.nome);
    setEditIdade(f.idade.toString());
    setDeletingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNome("");
    setEditIdade("");
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editNome.trim() || !editIdade) return;
    const idadeNum = parseInt(editIdade);
    if (isNaN(idadeNum) || idadeNum < 0) return;
    await onUpdateFamiliar(id, editNome.trim(), idadeNum);
    handleCancelEdit();
  };

  const handleDelete = async (id: string) => {
    await onDeleteFamiliar(id);
    if (deletingId === id) {
      setDeletingId(null);
    }
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
            {familiars.map((f) => {
              const isEditingThis = editingId === f.id;
              const isDeletingThis = deletingId === f.id;

              if (isEditingThis) {
                return (
                  <form
                    key={f.id}
                    onSubmit={(e) => handleUpdate(e, f.id)}
                    className="flex flex-col gap-2 p-3 rounded-lg bg-muted/60 border border-primary/30 animate-in fade-in duration-200"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Nome"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          disabled={loading}
                          required
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          max="150"
                          placeholder="Idade"
                          value={editIdade}
                          onChange={(e) => setEditIdade(e.target.value)}
                          disabled={loading}
                          required
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        <X className="size-3.5 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={loading || !editNome.trim() || !editIdade}
                      >
                        <Check className="size-3.5 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </form>
                );
              }

              return (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border group hover:border-border-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{f.nome}</p>
                      <p className="text-xs text-muted-foreground">{f.idade} {f.idade === 1 ? 'ano' : 'anos'}</p>
                    </div>
                  </div>

                  {isDeletingThis ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1">Excluir?</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setDeletingId(null)}
                        disabled={loading}
                        title="Cancelar exclusão"
                      >
                        <X className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-7"
                        onClick={() => handleDelete(f.id)}
                        disabled={loading}
                        title="Confirmar exclusão"
                      >
                        <Check className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleStartEdit(f)}
                        disabled={loading}
                        title="Editar familiar"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingId(f.id)}
                        disabled={loading}
                        title="Excluir familiar"
                      >
                        <Trash className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
