export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Error payload shape returned by the backend's GlobalExceptionHandler.
 * Mirrors `com.watchtonext.api.dto.ApiError` — see backend `docs/error-handling.md`.
 *
 * `code` is intentionally `string` (not a TS literal union of every backend
 * `ErrorEnum` value) so the client doesn't have to track every new code the
 * backend adds. Declare a local union when a specific consumer needs exhaustive
 * matching.
 */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: FieldError[];
}
