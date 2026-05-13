import type { ApiError, FieldError } from "@/types/api";

/**
 * Thrown by `services/api.ts` for any non-2xx response (including network
 * failures and timeouts). Carries the structured `ApiError` from the backend so
 * consumers can branch on `code` without parsing strings.
 */
export class ApiHttpError extends Error implements ApiError {
  readonly code: string;
  readonly status: number;
  readonly details?: FieldError[];

  constructor(payload: ApiError) {
    super(payload.message);
    this.name = "ApiHttpError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

export const TIMEOUT_ERROR_CODE = "TIMEOUT";
export const NETWORK_ERROR_CODE = "NETWORK_ERROR";
export const UNKNOWN_ERROR_CODE = "UNKNOWN";
