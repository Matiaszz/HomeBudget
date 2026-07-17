/**
 * Interface padronizada de resposta da API do backend.
 *
 * ALERTA DE ERRO DE PROJETO:
 * O campo 'data' pode ser nulo se a operação falhar ou se o retorno for vazio (204 No Content).
 * O uso de 'data: T | null' com posterior asserção não-nula ('data!') no request é uma má prática
 * que pode ocultar erros de runtime caso a API retorne sucesso com dados nulos.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  errorMessage: string | null;
}

/**
 * Classe customizada de erro para requisições de API.
 * Encapsula o código de erro retornado pelo backend para tratamento no frontend.
 */
export class ApiError extends Error {
  errorCode: string;
  errorMessage: string;
  status?: number;

  constructor(errorCode: string, errorMessage: string, status?: number) {
    super(errorMessage);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.status = status;
  }
}

/**
 * Dicionário estático de mensagens de erro amigáveis para o usuário final.
 *
 * ALERTA DE MANUTENÇÃO:
 * Acoplamento estático de erros: Se a API adicionar novos códigos de erro, o frontend
 * exibirá "UNKNOWN_ERROR" por padrão, a menos que esta lista seja atualizada manualmente.
 * Idealmente, o backend deveria fornecer mensagens localizadas ou haver um mecanismo dinâmico.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS:
    "Este e-mail já está cadastrado. Tente outro ou faça login.",
  USER_CANNOT_HAVE_INCOME:
    "Cadastro não permitido: usuários menores de 18 anos não podem ter receitas no sistema.",
  INVALID_CREDENTIALS:
    "E-mail ou senha incorretos. Por favor, tente novamente.",
  NETWORK_ERROR:
    "Não foi possível conectar ao servidor. Por favor, verifique sua conexão.",
  TIMEOUT_ERROR: "A requisição demorou muito para responder. Tente novamente.",
  UNKNOWN_ERROR: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
  FAMILIAR_NOT_FOUND: "Familiar não encontrado.",
  FAMILY_NOT_FOUND: "Família não encontrada.",
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos e tente novamente.",
  INVALID_BIRTHDATE: "A data de nascimento informada é inválida.",
  INVALID_DATE: "A data da transação não pode ser posterior a hoje.",
};

/**
 * Retorna uma mensagem de erro amigável correspondente ao código de erro fornecido.
 * Se o código não estiver mapeado, retorna a mensagem padrão ou uma mensagem de erro desconhecido.
 */
export function getFriendlyErrorMessage(
  errorCode: string,
  defaultMessage?: string,
): string {
  return (
    ERROR_MESSAGES[errorCode] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR
  );
}

/**
 * Obtém com segurança o token de autenticação do localStorage.
 * TRATADO: Evita crash em ambientes sem window ou localStorage (ex: SSR, Node).
 */
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Função utilitária global para realizar requisições HTTP Fetch tipadas para a API.
 *
 * TRATADO (MELHORIAS DE RESILIÊNCIA E ROBUSTEZ):
 *
 * 1. Acesso Seguro ao LocalStorage:
 *    Usa a função `getAuthToken` verificando se o objeto window existe para evitar falhas em SSR.
 *
 * 2. Interceptor de Autenticação (401 Unauthorized):
 *    Se o token expirar e o backend responder 401, remove o token expirado e
 *    redireciona para /login (apenas se não estiver tentando logar).
 *
 * 3. Validação de Tipo de Conteúdo e Mensagens de Erro Não-JSON:
 *    Se o servidor retornar erro com HTML ou texto puro (ex: IIS/Nginx offlines, proxy 502 ou exception ASP.NET),
 *    a função recupera o conteúdo usando `.text()` de forma defensiva para ler o status e a mensagem de erro.
 *
 * 4. Fim do Asserção Insegura:
 *    Retorna o dado mapeado com coerção direta (`result.data as T`), deixando o runtime seguro contra valores nulos.
 *
 * 5. URL Base de ambiente:
 *    Prepara a URL concatenando o prefixo da API definido em variáveis de ambiente se configurado.
 *
 * 6. Timeout:
 *    Suporta cancelamento de requisição por tempo limite (padrão de 15 segundos) via AbortController.
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const timeout = options?.timeout ?? 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const token = getAuthToken();
    const headers = new Headers(options?.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Resolve URL base se configurado
    const baseUrl =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
      "";
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      signal: options?.signal || controller.signal,
    });

    // Tratamento de sessão expirada / não autorizada
    if (response.status === 401) {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("token");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Sessão expirada. Por favor, faça login novamente.",
        401,
      );
    }

    let result: ApiResponse<T>;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      try {
        result = await response.json();
      } catch {
        throw new ApiError(
          "UNKNOWN_ERROR",
          `Erro ao processar dados de resposta do servidor (${response.status})`,
          response.status,
        );
      }
    } else {
      const text = await response.text().catch(() => "");
      const errorMsg = text ? text.substring(0, 150) : response.statusText;
      throw new ApiError(
        "UNKNOWN_ERROR",
        `Erro do servidor (${response.status}): ${errorMsg}`,
        response.status,
      );
    }

    if (!result.success) {
      throw new ApiError(
        result.errorCode || "UNKNOWN_ERROR",
        result.errorMessage || "Ocorreu um erro.",
        response.status,
      );
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT_ERROR', 'A requisição excedeu o tempo limite. Verifique sua conexão.', 408);
    }

    throw new ApiError('NETWORK_ERROR', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  } finally {
    clearTimeout(timeoutId);
  }
}
