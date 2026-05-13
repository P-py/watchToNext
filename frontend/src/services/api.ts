import type { ApiError } from "@/types/api";
import {
  ApiHttpError,
  NETWORK_ERROR_CODE,
  TIMEOUT_ERROR_CODE,
  UNKNOWN_ERROR_CODE,
} from "./api-error";

const DEFAULT_TIMEOUT_MS = 15_000;

function resolveBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required in production. Set it in your environment or .env file."
    );
  }
  return "http://localhost:8080/api";
}

const BASE_URL = resolveBaseUrl();

/**
 * Single switch for the whole frontend's mock mode. Services import this
 * constant instead of re-reading `process.env`.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

interface InternalOptions extends RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

async function request<T>(path: string, options: InternalOptions): Promise<T> {
  const { method, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), timeoutMs);

  // Bridge an externally-supplied signal so callers can also cancel.
  const onExternalAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason;
      const timedOut = reason instanceof DOMException && reason.name === "TimeoutError";
      throw new ApiHttpError({
        code: timedOut ? TIMEOUT_ERROR_CODE : UNKNOWN_ERROR_CODE,
        message: timedOut ? `request to ${path} timed out after ${timeoutMs}ms` : "request aborted",
        status: 0,
      });
    }
    throw new ApiHttpError({
      code: NETWORK_ERROR_CODE,
      message: cause instanceof Error ? cause.message : "network error",
      status: 0,
    });
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }

  if (!res.ok) {
    const payload = await parseErrorBody(res);
    throw new ApiHttpError(payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function parseErrorBody(res: Response): Promise<ApiError> {
  try {
    const raw = (await res.json()) as Partial<ApiError>;
    return {
      code: raw.code ?? UNKNOWN_ERROR_CODE,
      message: raw.message ?? res.statusText,
      status: raw.status ?? res.status,
      details: raw.details,
    };
  } catch {
    return {
      code: UNKNOWN_ERROR_CODE,
      message: res.statusText || "Request failed",
      status: res.status,
    };
  }
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "POST", body }),

  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "PATCH", body }),

  del: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
