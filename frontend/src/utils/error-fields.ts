import { ApiHttpError } from "@/services/api-error";

/**
 * Turns the backend `ApiError.details[]` into a `{ fieldName: message }` map
 * for direct binding to form field errors. Returns an empty object when the
 * error has no per-field details (non-validation errors, or 400s without a
 * `details` array).
 */
export function toFieldErrors(err: ApiHttpError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of err.details ?? []) {
    if (!(d.field in out)) out[d.field] = d.message;
  }
  return out;
}
