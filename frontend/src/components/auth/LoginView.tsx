import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { FormField } from "./FormField";

interface LoginViewProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  onSwitchToRegister: () => void;
}

export function LoginView({ onLogin, loading, onSwitchToRegister }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <AuthCard
      title="Acesse sua conta"
      description="Entre com seu e-mail e senha para gerenciar seu orçamento."
      icon={<LogIn className="size-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="email"
          type="email"
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        
        <FormField
          id="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <div className="pt-2">
          <Button type="submit" className="w-full h-9 text-sm font-medium transition-all group-hover/button:opacity-90" disabled={loading}>
            {loading ? "Entrando..." : "Entrar na plataforma"}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Não tem uma conta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-semibold transition-colors focus-visible:outline-none focus-visible:underline cursor-pointer"
            disabled={loading}
          >
            Cadastre-se aqui
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
