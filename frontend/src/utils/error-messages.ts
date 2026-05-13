import { ApiHttpError } from "@/services/api-error";

export interface ResolvedApiError {
  title: string;
  message: string;
}

const CATALOG: Record<string, ResolvedApiError> = {
  VALIDATION_FAILED: {
    title: "Dados inválidos",
    message: "Alguns campos estão inválidos. Revise e tente novamente.",
  },
  RESOURCE_NOT_FOUND: {
    title: "Não encontrado",
    message: "Não encontramos o que você procura.",
  },
  RESOURCE_CONFLICT: {
    title: "Conflito",
    message: "Essa ação conflita com dados existentes.",
  },
  METHOD_NOT_ALLOWED: {
    title: "Operação indisponível",
    message: "Essa operação não está disponível agora.",
  },
  NOT_ACCEPTABLE: {
    title: "Formato não suportado",
    message: "Não foi possível concluir a operação. Tente novamente em instantes.",
  },
  UNSUPPORTED_MEDIA_TYPE: {
    title: "Formato não suportado",
    message: "Não foi possível concluir a operação. Tente novamente em instantes.",
  },
  UPSTREAM_TIMEOUT: {
    title: "Tempo esgotado",
    message: "O servidor demorou muito para responder. Tente novamente.",
  },
  TIMEOUT: {
    title: "Tempo esgotado",
    message: "A requisição demorou muito. Verifique sua conexão e tente novamente.",
  },
  NETWORK_ERROR: {
    title: "Problema de conexão",
    message: "Não conseguimos falar com o servidor. Verifique sua internet.",
  },
  INTERNAL_ERROR: {
    title: "Erro inesperado",
    message: "Algo deu errado do nosso lado. Tente novamente em instantes.",
  },
  UNKNOWN: {
    title: "Erro inesperado",
    message: "Não foi possível concluir a operação. Tente novamente em instantes.",
  },
};

/**
 * Maps a backend ErrorEnum code (or one of the FE-only network codes) to
 * user-facing pt-BR copy. Unknown codes fall back to the backend `message`,
 * which is already in pt-BR by contract (see docs/error-handling.md).
 */
export function resolveApiError(err: ApiHttpError): ResolvedApiError {
  const canned = CATALOG[err.code];
  if (canned) return canned;
  return {
    title: "Erro inesperado",
    message: err.message || CATALOG.UNKNOWN.message,
  };
}
