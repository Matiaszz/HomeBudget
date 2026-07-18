import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { apiRequest, ApiError, getFriendlyErrorMessage } from "./utils/api";
import {
  LogOut,
  ShieldAlert,
  User as UserIcon,
  CheckCircle2,
  Home,
  X
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LoginView } from "@/components/auth/LoginView";
import { RegisterView } from "@/components/auth/RegisterView";
import { AuthVisualNarrative } from "@/components/auth/AuthVisualNarrative";
import { TransactionsManager } from "@/components/dashboard/TransactionsManager";
import { FamilySelectionView } from "@/components/family/FamilySelectionView";
import { FamiliarsManager } from "@/components/family/FamiliarsManager";
import { FormField } from "@/components/auth/FormField";
import { FamiliarReports } from "@/components/dashboard/FamiliarReports";
import { 
  type Family, 
  type UserDto, 
  type Transaction, 
  type Familiar, 
  type PagedResult 
} from "@/types";
import { recalculateSummary } from "@/utils/finance";

interface LoginResponse {
  token: string;
  user: UserDto;
}

export default function App() {
  // Authentication states
  const [user, setUser] = useState<UserDto | null>(null);

  // Path tracking and auth sub-view states
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [authSubView, setAuthSubView] = useState<"login" | "register">("login");

  // Family and Familiar states
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [familiars, setFamiliars] = useState<Familiar[]>([]);
  const [familiarsPage, setFamiliarsPage] = useState(1);
  const [familiarsTotalPages, setFamiliarsTotalPages] = useState(1);
  const [familiarsTotalCount, setFamiliarsTotalCount] = useState(0);

  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Consolidação orçamentária do ledger (para resumos e gráficos)
  const [budgetSummary, setBudgetSummary] = useState<{
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    familiarExpenses: { familiarId: string; familiarName: string; totalExpense: number }[];
    categoryExpenses: { category: string; totalAmount: number }[];
    familiarSummaries: { familiarId: string; familiarName: string; totalIncome: number; totalExpense: number; netBalance: number }[];
  } | null>(null);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Tab and profile form states
  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "reports">("dashboard");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBirthdate, setProfileBirthdate] = useState("");

  // Sync profile editing fields when user loads or updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileBirthdate(user.birthdate ? user.birthdate.split("T")[0] : "");
    }
  }, [user]);

  // Auto-clear success messages after 4 seconds to make them temporary
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-clear error messages after 5 seconds to make them temporary
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Navigation helper
  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setCurrentPath(to);
  };

  // Sync current path on popstate (browser navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch families from backend
  const fetchFamilies = useCallback(async () => {
    try {
      const response = await apiRequest<Family[]>("/api/families");
      setFamilies(response);
    } catch (err) {
      console.error("Erro ao carregar famílias", err);
    }
  }, []);

  // Fetch familiars from backend (paginated)
  const fetchFamiliars = useCallback(async (familyId: string, page: number = 1) => {
    try {
      const response = await apiRequest<PagedResult<Familiar>>(`/api/families/${familyId}/familiars?page=${page}&pageSize=10`);
      setFamiliars(response.items);
      setFamiliarsPage(response.page);
      setFamiliarsTotalPages(response.totalPages);
      setFamiliarsTotalCount(response.totalCount);
    } catch (err) {
      console.error("Erro ao carregar familiares", err);
    }
  }, []);

  // Fetch transactions from backend (ledger)
  const fetchTransactions = useCallback(async (familyId: string) => {
    try {
      const response = await apiRequest<Transaction[]>(`/api/families/${familyId}/transactions`);
      setTransactions(response);
    } catch (err) {
      console.error("Erro ao carregar transações", err);
    }
  }, []);

  // Fetch consolidated budget summary (ledger running calculations & chart aggregates)
  const fetchBudgetSummary = useCallback(async (familyId: string) => {
    try {
      const response = await apiRequest<typeof budgetSummary>(`/api/families/${familyId}/transactions/summary`);
      setBudgetSummary(response);
    } catch (err) {
      console.error("Erro ao carregar consolidação orçamentária", err);
    }
  }, []);

  // Load user data and state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser) as UserDto;
      setUser(parsedUser);
    }
  }, []);

  // Sync families and selected family when user state changes
  useEffect(() => {
    if (user) {
      fetchFamilies();

      const storedFamily = localStorage.getItem(`selected_family_${user.id}`);
      if (storedFamily) {
        const family = JSON.parse(storedFamily) as Family;
        setSelectedFamily(family);
        setFamiliarsPage(1);
        fetchFamiliars(family.id, 1);
        fetchTransactions(family.id);
        fetchBudgetSummary(family.id);
      }
    } else {
      setFamilies([]);
      setSelectedFamily(null);
      setFamiliars([]);
    }
  }, [user, fetchFamilies, fetchFamiliars, fetchTransactions, fetchBudgetSummary]);

  // Simple client-side Router redirect logic
  useEffect(() => {
    if (user) {
      if (currentPath === "/auth") {
        navigate("/");
      }
    } else {
      if (currentPath !== "/auth") {
        navigate("/auth");
      }
    }
  }, [user, currentPath]);

  const handleLogout = () => {
    if (user) {
      localStorage.removeItem(`selected_family_${user.id}`);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTransactions([]);
    setFamilies([]);
    setSelectedFamily(null);
    setFamiliars([]);
    setActiveTab("dashboard");
    setSuccess("Sessão encerrada com sucesso.");
    setError(null);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
      setSuccess(`Bem-vindo de volta, ${response.user.name}!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Ocorreu um erro desconhecido ao entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, birthdate: string, password: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !birthdate) {
      setError("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      await apiRequest<UserDto>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          birthDate: new Date(birthdate).toISOString(),
        }),
      });

      setSuccess("Conta criada com sucesso! Faça seu login.");
      setAuthSubView("login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Ocorreu um erro ao criar a conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFamily = (family: Family) => {
    setSelectedFamily(family);
    if (user) {
      localStorage.setItem(`selected_family_${user.id}`, JSON.stringify(family));
    }
    setFamiliarsPage(1);
    fetchFamiliars(family.id, 1);
    fetchTransactions(family.id);
    fetchBudgetSummary(family.id);
  };

  const handleCreateFamily = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const newFamily = await apiRequest<Family>("/api/families", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setFamilies((prev) => [...prev, newFamily]);
      handleSelectFamily(newFamily);
      setSuccess("Família criada com sucesso!");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao criar família.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFamily = async (id: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedFamily = await apiRequest<Family>(`/api/families/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      // Atualiza a lista de famílias no estado
      setFamilies((prev) => prev.map((f) => (f.id === id ? updatedFamily : f)));
      // Se a família editada for a atualmente selecionada, atualiza também os dados dela no painel
      if (selectedFamily && selectedFamily.id === id) {
        setSelectedFamily(updatedFamily);
      }
      setSuccess("Família atualizada com sucesso!");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao atualizar família.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Exclui uma família via API DELETE /api/families/{id}
  const handleDeleteFamily = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest<void>(`/api/families/${id}`, {
        method: "DELETE",
      });
      // Remove a família excluída do estado
      setFamilies((prev) => prev.filter((f) => f.id !== id));
      // Se a família excluída era a ativa no painel, desmarca e limpa a lista de familiares
      if (selectedFamily && selectedFamily.id === id) {
        setSelectedFamily(null);
        setFamiliars([]);
      }
      setSuccess("Família excluída com sucesso!");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao excluir família.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamiliar = async (name: string, birthdate: string) => {
    if (!selectedFamily) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest<Familiar>(`/api/families/${selectedFamily.id}/familiars`, {
        method: "POST",
        body: JSON.stringify({ name, birthdate: new Date(birthdate).toISOString() }),
      });
      setSuccess("Familiar adicionado com sucesso!");
      // Reload current page to get updated paginated list from backend
      await fetchFamiliars(selectedFamily.id, familiarsPage);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao adicionar familiar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Updates a family member via API PUT /api/families/{familyId}/familiars/{id}
  const handleUpdateFamiliar = async (id: string, name: string, birthdate: string) => {
    if (!selectedFamily) return;
    setLoading(true);
    setError(null);
    try {
      const updatedFamiliar = await apiRequest<Familiar>(`/api/families/${selectedFamily.id}/familiars/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, birthdate: new Date(birthdate).toISOString() }),
      });
      // Update the modified familiar in state
      setFamiliars((prev) => prev.map((f) => (f.id === id ? updatedFamiliar : f)));
      setSuccess("Familiar atualizado com sucesso!");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao atualizar familiar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Exclui um familiar via API DELETE /api/families/{familyId}/familiars/{id}
  const handleDeleteFamiliar = async (id: string) => {
    if (!selectedFamily) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest<void>(`/api/families/${selectedFamily.id}/familiars/${id}`, {
        method: "DELETE",
      });
      setSuccess("Familiar removido com sucesso!");
      // Se era o único item da página e estamos em uma página maior que 1, volta uma página
      const isOnlyItem = familiars.length === 1 && familiarsPage > 1;
      const targetPage = isOnlyItem ? familiarsPage - 1 : familiarsPage;
      await fetchFamiliars(selectedFamily.id, targetPage);

      // Recalcula transações e budgetSummary localmente sem chamar o backend
      const updatedTransactions = transactions.filter(t => t.familiarId !== id);
      setTransactions(updatedTransactions);
      setBudgetSummary(recalculateSummary(updatedTransactions));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao remover familiar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeFamily = () => {
    if (user) {
      localStorage.removeItem(`selected_family_${user.id}`);
    }
    setSelectedFamily(null);
    setFamiliars([]);
    setFamiliarsPage(1);
    setFamiliarsTotalPages(1);
    setFamiliarsTotalCount(0);
    setBudgetSummary(null);
  };

  const handleAddTransaction = async (tx: {
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    familiarId?: string;
  }) => {
    if (!selectedFamily) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest<Transaction>(`/api/families/${selectedFamily.id}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          familiarId: tx.familiarId || null
        }),
      });
      setSuccess("Transação adicionada com sucesso!");
      await fetchTransactions(selectedFamily.id);
      await fetchBudgetSummary(selectedFamily.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(getFriendlyErrorMessage(err.errorCode, err.errorMessage));
      } else {
        setError("Erro ao adicionar transação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail || !profileBirthdate) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    // Recalculate canHaveIncome based on birthdate
    const today = new Date();
    const birthDate = new Date(profileBirthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    const canHaveIncome = age >= 18;

    const updatedUser: UserDto = {
      ...user!,
      name: profileName,
      email: profileEmail,
      birthdate: profileBirthdate,
      canHaveIncome
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSuccess("Perfil atualizado com sucesso!");
    setError(null);
    setActiveTab("dashboard");
  };

  // Route 1: Auth screen (Login / Register)
  if (currentPath === "/auth") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground relative font-sans">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border border-border animate-in fade-in spin-in-12 duration-500">
                <Logo className="size-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                HomeBudget
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 z-10">
          {/* Left panel: Auth Form */}
          <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-20 bg-background overflow-y-auto">
            <div className="w-full max-w-md space-y-6">

              {/* Messages Alert */}
              {error && (
                <div className="relative p-4 pr-10 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <span className="font-semibold text-destructive">Ops! Algo deu errado</span>
                    <p className="mt-0.5">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="absolute top-3 right-3 text-destructive/70 hover:text-destructive cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {success && (
                <div className="relative p-4 pr-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-850 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-950">Sucesso!</span>
                    <p className="mt-0.5">{success}</p>
                  </div>
                  <button
                    onClick={() => setSuccess(null)}
                    className="absolute top-3 right-3 text-emerald-650 hover:text-emerald-850 cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* VIEW: LOGIN */}
              {authSubView === "login" && (
                <LoginView
                  onLogin={handleLogin}
                  loading={loading}
                  onSwitchToRegister={() => {
                    setAuthSubView("register");
                    setError(null);
                    setSuccess(null);
                  }}
                />
              )}

              {/* VIEW: REGISTER */}
              {authSubView === "register" && (
                <RegisterView
                  onRegister={handleRegister}
                  loading={loading}
                  onSwitchToLogin={() => {
                    setAuthSubView("login");
                    setError(null);
                    setSuccess(null);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right panel: Premium Visual Narrative (hidden on mobile, split-screen on desktop) */}
          <div className="hidden md:block border-l border-border h-full bg-muted/10">
            <AuthVisualNarrative />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground bg-muted/30 shrink-0">
          <p>&copy; {new Date().getFullYear()} HomeBudget. Todos os direitos reservados.</p>
          <p className="mt-1 text-muted-foreground/80">Desenvolvido com .NET 10, .NET Aspire, React e Tailwind CSS v4.</p>
        </footer>
      </div>
    );
  }

  // Route 2: Family Selection screen if no family is selected
  if (!selectedFamily) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground relative font-sans">
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border border-border">
                <Logo className="size-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                HomeBudget
              </span>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  Olá, <span className="font-semibold text-foreground">{user.name}</span>
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12 md:py-16 z-10 max-w-6xl w-full mx-auto">
          <div className="w-full">
            <div className="max-w-md mx-auto mb-6">
              {error && (
                <div className="relative p-4 pr-10 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <span className="font-semibold text-destructive">Ops! Algo deu errado</span>
                    <p className="mt-0.5">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="absolute top-3 right-3 text-destructive/70 hover:text-destructive cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="relative p-4 pr-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-850 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-950">Sucesso!</span>
                    <p className="mt-0.5">{success}</p>
                  </div>
                  <button
                    onClick={() => setSuccess(null)}
                    className="absolute top-3 right-3 text-emerald-650 hover:text-emerald-850 cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>

            <FamilySelectionView
              families={families}
              onSelectFamily={handleSelectFamily}
              onCreateFamily={handleCreateFamily}
              onUpdateFamily={handleUpdateFamily}
              onDeleteFamily={handleDeleteFamily}
              loading={loading}
              onLogout={handleLogout}
            />
          </div>
        </main>

        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground bg-muted/30">
          <p>&copy; {new Date().getFullYear()} HomeBudget. Todos os direitos reservados.</p>
          <p className="mt-1 text-muted-foreground/80">Desenvolvido com .NET 10, .NET Aspire, React e Tailwind CSS v4.</p>
        </footer>
      </div>
    );
  }

  // Route 3: Dashboard screen (when user and family are selected)
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground relative font-sans">

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center border border-border">
              <Logo className="size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-foreground leading-none">
                HomeBudget
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                {selectedFamily.name}
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Olá, <span className="font-semibold text-foreground">{user.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangeFamily}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Home className="size-4" />
                Trocar Família
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <LogOut className="size-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12 md:py-16 z-10 max-w-6xl w-full mx-auto">
        <div className="w-full">
          {/* Messages Alert */}
          <div className="max-w-md mx-auto">
            {error && (
              <div className="relative mb-6 p-4 pr-10 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert className="size-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <span className="font-semibold text-destructive">Ops! Algo deu errado</span>
                  <p className="mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="absolute top-3 right-3 text-destructive/70 hover:text-destructive cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="relative mb-6 p-4 pr-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-850 flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="text-emerald-955 font-medium">Sucesso!</span>
                  <p className="mt-0.5">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess(null)}
                  className="absolute top-3 right-3 text-emerald-650 hover:text-emerald-850 cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>
          {/* VIEW: TABS SELECTOR */}
          {user && (
            <div className="flex gap-2 border-b border-border mb-6 w-full animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`pb-3 px-4 text-sm font-medium transition-all relative cursor-pointer focus-visible:outline-none ${activeTab === "dashboard"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Dashboard
                {activeTab === "dashboard" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-200" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("reports")}
                className={`pb-3 px-4 text-sm font-medium transition-all relative cursor-pointer focus-visible:outline-none ${activeTab === "reports"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Relatórios por Membro
                {activeTab === "reports" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-200" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`pb-3 px-4 text-sm font-medium transition-all relative cursor-pointer focus-visible:outline-none ${activeTab === "profile"
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Perfil
                {activeTab === "profile" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-200" />
                )}
              </button>
            </div>
          )}

          {/* VIEW: DASHBOARD */}
          {user && activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* Family Members Column (Left side) */}
              <div className="space-y-6">
                <FamiliarsManager
                  familiars={familiars}
                  onCreateFamiliar={handleCreateFamiliar}
                  onUpdateFamiliar={handleUpdateFamiliar}
                  onDeleteFamiliar={handleDeleteFamiliar}
                  loading={loading}
                  page={familiarsPage}
                  totalPages={familiarsTotalPages}
                  totalCount={familiarsTotalCount}
                  onPageChange={(page) => selectedFamily && fetchFamiliars(selectedFamily.id, page)}
                />
              </div>

              {/* Transactions/Budget part (Right side) */}
              <div className="lg:col-span-2">
                <TransactionsManager
                  user={user}
                  transactions={transactions}
                  familiars={familiars}
                  summary={budgetSummary}
                  onAddTransaction={handleAddTransaction}
                  onGoToReports={() => setActiveTab("reports")}
                />
              </div>

            </div>
          )}

          {/* VIEW: REPORTS */}
          {user && activeTab === "reports" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <FamiliarReports
                familiars={familiars}
                transactions={transactions}
                onBackToDashboard={() => setActiveTab("dashboard")}
              />
            </div>
          )}

          {/* VIEW: PROFILE (Editable) */}
          {user && activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card className="border-border bg-card max-w-xl mx-auto">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                    <UserIcon className="size-5 text-primary" />
                    Perfil do Usuário
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Edite seus dados pessoais de cadastro abaixo.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <FormField
                      id="profile-name"
                      type="text"
                      label="Nome Completo"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      disabled={loading}
                    />

                    <FormField
                      id="profile-email"
                      type="email"
                      label="E-mail"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                      disabled={loading}
                    />

                    <FormField
                      id="profile-birthdate"
                      type="date"
                      label="Data de Nascimento"
                      value={profileBirthdate}
                      onChange={(e) => setProfileBirthdate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset form and go back to dashboard
                        setProfileName(user.name);
                        setProfileEmail(user.email);
                        setProfileBirthdate(user.birthdate ? user.birthdate.split("T")[0] : "");
                        setActiveTab("dashboard");
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground bg-muted/30">
        <p>&copy; {new Date().getFullYear()} HomeBudget. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
