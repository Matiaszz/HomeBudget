import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, LogOut, ArrowRight, Home, Pencil, Trash, Check, X } from "lucide-react";

interface Family {
  id: string;
  name: string;
}

interface FamilySelectionViewProps {
  families: Family[];
  onSelectFamily: (family: Family) => void;
  onCreateFamily: (name: string) => Promise<void>;
  onUpdateFamily: (id: string, name: string) => Promise<void>;
  onDeleteFamily: (id: string) => Promise<void>;
  loading: boolean;
  onLogout: () => void;
}

export function FamilySelectionView({
  families,
  onSelectFamily,
  onCreateFamily,
  onUpdateFamily,
  onDeleteFamily,
  loading,
  onLogout,
}: FamilySelectionViewProps) {
  // Estados para criação de nova família
  const [newFamilyName, setNewFamilyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Estados para controle de edição inline de uma família existente
  const [editingId, setEditingId] = useState<string | null>(null); // Guarda o ID da família sendo editada
  const [editName, setEditName] = useState("");                     // Guarda o nome temporário em edição
  const [deletingId, setDeletingId] = useState<string | null>(null); // Guarda o ID da família pendente de exclusão

  // Envia requisição para criar uma nova família
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    await onCreateFamily(newFamilyName.trim());
    setNewFamilyName("");
    setIsCreating(false);
  };

  // Prepara o estado para edição de uma família específica
  // NOTA: Usa-se stopPropagation() para evitar que o clique acione a seleção da família
  const handleStartEdit = (e: React.MouseEvent, f: Family) => {
    e.stopPropagation();
    setEditingId(f.id);
    setEditName(f.name);
    setDeletingId(null);
  };

  // Cancela a edição e limpa campos temporários
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName("");
  };

  // Envia requisição para atualizar o nome da família sendo editada inline
  const handleUpdateSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await onUpdateFamily(id, editName.trim());
    setEditingId(null);
    setEditName("");
  };

  // Confirma a exclusão de uma família específica
  const handleDeleteConfirm = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await onDeleteFamily(id);
    if (deletingId === id) {
      setDeletingId(null);
    }
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
                    {families.map((family) => {
                      const isEditingThis = editingId === family.id;
                      const isDeletingThis = deletingId === family.id;

                      if (isEditingThis) {
                        return (
                          <form
                            key={family.id}
                            onSubmit={(e) => handleUpdateSubmit(e, family.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full p-3 rounded-xl border border-primary/30 bg-muted/60 flex flex-col gap-2.5 animate-in fade-in duration-200"
                          >
                            <div className="space-y-1">
                              <label htmlFor={`edit-fam-${family.id}`} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Nome da Família
                              </label>
                              <Input
                                id={`edit-fam-${family.id}`}
                                placeholder="Ex: Família Silva"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                disabled={loading}
                                required
                                className="h-9 text-xs"
                              />
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
                                disabled={loading || !editName.trim()}
                              >
                                <Check className="size-3.5 mr-1" />
                                Salvar
                              </Button>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={family.id}
                          className="w-full p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 flex items-center justify-between transition-all duration-200 group"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectFamily(family)}
                            className="flex-1 flex items-center gap-3 text-left cursor-pointer font-sans"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                              <Home className="size-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{family.name}</p>
                            </div>
                          </button>

                          {isDeletingThis ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1">Excluir?</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(null);
                                }}
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
                                onClick={(e) => handleDeleteConfirm(e, family.id)}
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
                                onClick={(e) => handleStartEdit(e, family)}
                                disabled={loading}
                                title="Editar nome da família"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(family.id);
                                }}
                                disabled={loading}
                                title="Excluir família"
                              >
                                <Trash className="size-3.5" />
                              </Button>
                              <button
                                type="button"
                                onClick={() => onSelectFamily(family)}
                                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ml-1 animate-in fade-in duration-200"
                                title="Acessar painel da família"
                              >
                                <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
