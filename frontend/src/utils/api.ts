export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export class ApiError extends Error {
  errorCode: string;
  errorMessage: string;

  constructor(errorCode: string, errorMessage: string) {
    super(errorMessage);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}

export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'Este e-mail já está cadastrado. Tente outro ou faça login.',
  USER_CANNOT_HAVE_INCOME: 'Cadastro não permitido: usuários menores de 18 anos não podem ter receitas no sistema.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos. Por favor, tente novamente.',
  NETWORK_ERROR: 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão.',
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  FAMILIAR_NOT_FOUND: 'Familiar não encontrado.',
  FAMILY_NOT_FOUND: 'Família não encontrada.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos e tente novamente.',
  INVALID_BIRTHDATE: 'A data de nascimento informada é inválida.',
  INVALID_DATE: 'A data da transação não pode ser posterior a hoje.',
};

export function getFriendlyErrorMessage(errorCode: string, defaultMessage?: string): string {
  return ERROR_MESSAGES[errorCode] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const token = localStorage.getItem('token');
    const headers = new Headers(options?.headers);
    
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let result: ApiResponse<T>;
    try {
      result = await response.json();
    } catch {
      throw new ApiError('UNKNOWN_ERROR', `Erro do servidor (${response.status})`);
    }

    if (!result.success) {
      throw new ApiError(result.errorCode || 'UNKNOWN_ERROR', result.errorMessage || 'Ocorreu um erro.');
    }

    return result.data!;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('NETWORK_ERROR', 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  }
}
