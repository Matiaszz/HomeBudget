import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { FormField } from "./FormField";

interface RegisterViewProps {
  onRegister: (name: string, email: string, birthdate: string, password: string) => Promise<void>;
  loading: boolean;
  onSwitchToLogin: () => void;
}

export function RegisterView({ onRegister, loading, onSwitchToLogin }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = birthdate ? calculateAge(birthdate) : null;
  const isUnderage = age !== null && age < 18;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnderage) return;
    onRegister(name, email, birthdate, password);
  };

  return (
    <AuthCard
      title="Crie sua conta"
      description="Preencha os dados abaixo para começar. Atenção: você deve ser maior de 18 anos."
      icon={<UserPlus className="size-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="reg-name"
          type="text"
          label="Nome Completo"
          placeholder="João da Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <FormField
          id="reg-email"
          type="email"
          label="E-mail"
          placeholder="joao@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <FormField
          id="reg-birthdate"
          type="date"
          label="Data de Nascimento"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          required
          disabled={loading}
          error={isUnderage ? "Você deve ter pelo menos 18 anos de idade para se cadastrar." : undefined}
        />

        <FormField
          id="reg-pass"
          type="password"
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />

        <div className="pt-2">
          <Button type="submit" className="w-full h-9 text-sm font-medium transition-all" disabled={loading || isUnderage}>
            {loading ? "Criando conta..." : "Criar minha conta"}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-semibold transition-colors focus-visible:outline-none focus-visible:underline cursor-pointer"
            disabled={loading}
          >
            Faça login
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
