import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, UserCheck, Pencil, Trash, Check, X, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";

import { type Familiar } from "@/types";
import { getLocalDateString } from "@/utils/finance";


interface FamiliarsManagerProps {
  familiars: Familiar[];
  onCreateFamiliar: (name: string, birthdate: string) => Promise<void>;
  onUpdateFamiliar: (id: string, name: string, birthdate: string) => Promise<void>;
  onDeleteFamiliar: (id: string) => Promise<void>;
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}



const todayStr = getLocalDateString();

// Minimum allowed birthdate = 150 years ago
const minBirthdateStr = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 150);
  return getLocalDateString(d);
})();

export function FamiliarsManager({
  familiars,
  onCreateFamiliar,
  onUpdateFamiliar,
  onDeleteFamiliar,
  loading,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: FamiliarsManagerProps) {
  // Add-form state
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBirthdate, setEditBirthdate] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Delete-confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Validates a birthdate string; returns an error message or null
  const validateBirthdate = (dateStr: string): string | null => {
    if (!dateStr) return "A data de nascimento é obrigatória.";
    if (dateStr > todayStr) return "A data de nascimento não pode ser uma data futura.";
    if (dateStr < minBirthdateStr) return "A data de nascimento resultaria em uma idade superior a 150 anos.";
    return null;
  };

  // Submit new familiar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newName.trim()) {
      setFormError("O nome do familiar é obrigatório.");
      return;
    }
    const dateError = validateBirthdate(newBirthdate);
    if (dateError) {
      setFormError(dateError);
      return;
    }
    await onCreateFamiliar(newName.trim(), newBirthdate);
    setNewName("");
    setNewBirthdate("");
    setIsAdding(false);
    setFormError(null);
  };

  // Start inline edit
  const handleStartEdit = (f: Familiar) => {
    setEditingId(f.id);
    setEditName(f.name);
    setEditBirthdate(f.birthdate ? f.birthdate.split("T")[0] : "");
    setDeletingId(null);
    setEditError(null);
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditBirthdate("");
    setEditError(null);
  };

  // Submit inline edit
  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditError(null);
    if (!editName.trim()) {
      setEditError("O nome do familiar é obrigatório.");
      return;
    }
    const dateError = validateBirthdate(editBirthdate);
    if (dateError) {
      setEditError(dateError);
      return;
    }
    await onUpdateFamiliar(id, editName.trim(), editBirthdate);
    handleCancelEdit();
  };

  // Confirm delete
  const handleDelete = async (id: string) => {
    await onDeleteFamiliar(id);
    if (deletingId === id) setDeletingId(null);
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
            {familiars.map((familiar) => {
              const isEditingThis = editingId === familiar.id;
              const isDeletingThis = deletingId === familiar.id;

              if (isEditingThis) {
                return (
                  <form
                    key={familiar.id}
                    onSubmit={(e) => handleUpdate(e, familiar.id)}
                    className="flex flex-col gap-2 p-3 rounded-lg bg-muted/60 border border-primary/30 animate-in fade-in duration-200"
                  >
                    {editError && (
                      <div className="flex items-start gap-1.5 text-[11px] text-destructive animate-in fade-in duration-200">
                        <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
                        <span>{editError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Input
                          placeholder="Nome"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={loading}
                          required
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Input
                          type="date"
                          max={todayStr}
                          min={minBirthdateStr}
                          value={editBirthdate}
                          onChange={(e) => setEditBirthdate(e.target.value)}
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
                        disabled={loading || !editName.trim() || !editBirthdate}
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
                  key={familiar.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border group hover:border-border-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{familiar.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {familiar.age} {familiar.age === 1 ? "ano" : "anos"}
                      </p>
                    </div>
                  </div>

                  {isDeletingThis ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-1">
                        Excluir?
                      </span>
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
                        onClick={() => handleDelete(familiar.id)}
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
                        onClick={() => handleStartEdit(familiar)}
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
                        onClick={() => setDeletingId(familiar.id)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-border animate-in fade-in duration-200">
            <span className="text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "membro" : "membros"} ({page}/{totalPages})
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || loading}
                title="Página Anterior"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || loading}
                title="Próxima Página"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
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
          <form
            onSubmit={handleSubmit}
            className="space-y-3 p-3 border border-border rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {formError && (
              <div className="flex items-start gap-1.5 text-[11px] text-destructive animate-in fade-in duration-200">
                <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
            <div className="space-y-1">
              <label
                htmlFor="familiar-name"
                className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Nome
              </label>
              <Input
                id="familiar-name"
                placeholder="Nome do familiar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={loading}
                required
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="familiar-birthdate"
                className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Data de Nascimento
              </label>
              <Input
                id="familiar-birthdate"
                type="date"
                max={todayStr}
                min={minBirthdateStr}
                value={newBirthdate}
                onChange={(e) => setNewBirthdate(e.target.value)}
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
                onClick={() => {
                  setIsAdding(false);
                  setFormError(null);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="flex-1 h-8 text-xs"
                disabled={loading || !newName.trim() || !newBirthdate}
              >
                Salvar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
