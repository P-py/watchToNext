# Error Handling

How the backend reports errors to API clients, and the rules controllers and services follow so that contract holds.

## The contract: `ApiError`

Every error response — without exception — uses this JSON shape:

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "movie 999 not found",
  "status": 404,
  "details": [
    { "field": "rating", "message": "must be less than or equal to 5.0" }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `code` | `ErrorEnum` (string) | Machine-readable. Frontend switches on this. Controlled vocabulary owned by the backend (`com.watchtonext.api.dto.ErrorEnum`). |
| `message` | string | Human-readable, safe to show in UI. Never the raw exception message. |
| `status` | int | HTTP status code; mirrors the response status header. |
| `details` | array? | Field-level errors. Present for validation failures, omitted otherwise (`@JsonInclude(NON_NULL)`). |

**No** `path`, `timestamp`, `trace`, `error` reason phrase, or any other field. Those either duplicate information the client already has or expose internal state.

## The `ErrorEnum` catalog

`com.watchtonext.api.dto.ErrorEnum` is the single source of truth. Each value pins a canonical HTTP status:

| `code` | HTTP | When it fires |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Bean Validation on `@RequestBody` (`@Valid`), `@RequestParam`/`@PathVariable` (`@Validated` + jakarta constraints), `MethodArgumentTypeMismatch` (e.g. `/movies/abc` for a `Long`), `MissingServletRequestParameter`, `HttpMessageNotReadable`, `IllegalArgumentException`. |
| `RESOURCE_NOT_FOUND` | 404 | A service throws `ResponseStatusException(NOT_FOUND, ...)`. Also fires for unknown routes (see config below). |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP verb on an existing path. |
| `NOT_ACCEPTABLE` | 406 | `Accept` header can't be satisfied. |
| `RESOURCE_CONFLICT` | 409 | `DataIntegrityViolationException` (unique constraint, FK violation, etc.). |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | `Content-Type` not supported. |
| `UPSTREAM_TIMEOUT` | 504 | `QueryTimeoutException`, `AsyncRequestTimeoutException`, `TimeoutException`. |
| `INTERNAL_ERROR` | 500 | Anything uncaught. Message is always literal `"Internal server error"`; root cause is logged with full stack. |

Adding a new code: extend the enum, add a `when` arm in `ErrorEnum.fromStatus`, and either throw `ResponseStatusException(new status, ...)` from a service or add a dedicated `@ExceptionHandler` in `GlobalExceptionHandler`.

## How it's wired

```
controller/advice/GlobalExceptionHandler.kt
  └── @RestControllerAdvice
      └── extends ResponseEntityExceptionHandler
          ├── overrides createResponseEntity(...)   → normalizes Spring MVC defaults
          └── @ExceptionHandler(...) for project-specific cases
```

- **Project exceptions** (`ConstraintViolationException`, `ResponseStatusException`, `DataIntegrityViolationException`, timeouts, `IllegalArgumentException`, `Exception` fallback) have explicit handlers that build the `ApiError` directly.
- **Spring MVC built-ins** (`HttpRequestMethodNotSupported`, `HttpMediaTypeNotSupported`, `HttpMediaTypeNotAcceptable`, `NoHandlerFoundException`, `NoResourceFoundException`, `MethodArgumentNotValid`, `MethodArgumentTypeMismatch`, `MissingServletRequestParameter`, `HttpMessageNotReadable`) are handled by the parent class. The `createResponseEntity` override intercepts the parent's default `ProblemDetail` body and rewrites it as `ApiError` so every response shares the contract.

### Required configuration

`application.properties`:

```properties
spring.mvc.throw-exception-if-no-handler-found=true
spring.web.resources.add-mappings=false
```

Without these, unknown routes silently fall through to the static-resource handler and return Spring's Whitelabel 404 instead of an `ApiError`.

## Rules for new code

### Services
- **Throw `ResponseStatusException`** with the right status when a request can't be honored:
  ```kotlin
  if (!movieRepository.existsById(id)) {
      throw ResponseStatusException(HttpStatus.NOT_FOUND, "movie $id not found")
  }
  ```
- **Do not** use `require(...)` or `check(...)` for request validation — they throw `IllegalArgumentException` / `IllegalStateException`, which the handler maps to a generic 400 with no semantic code. Use them only for genuine programmer-error invariants.
- The `reason` passed to `ResponseStatusException` becomes the `message` field — treat it as user-facing. Don't include internal IDs, SQL, query plans, or stack details.

### Controllers
- Stay thin: parse, delegate, map to DTO, return. No `try/catch`.
- Declarative validation only:
  - `@RequestBody` DTOs: annotate fields with jakarta constraints (`@NotNull`, `@DecimalMin`, etc.) and use `@Valid` on the parameter.
  - `@RequestParam` / `@PathVariable`: annotate the class with `@Validated` and put constraints (`@NotBlank`, `@Min`, …) directly on the parameter.
- Don't catch exceptions to translate them — the advice already does that globally.

### Exception messages
- **Never** echo `ex.message`, stack frames, SQL, file paths, or class names in the response body. The advice already enforces this for `IllegalArgumentException`, `DataIntegrityViolationException`, timeouts, and the generic fallback; keep the discipline when adding new handlers.
- Always log the original exception:
  - 5xx: `log.error("...", ex)` with the full stack.
  - 4xx: `log.warn("... {}: {}", request.requestURI, ex.message)` — short, no stack.

## Example responses

`GET /api/movies` (missing `q`):
```json
{
  "code": "VALIDATION_FAILED",
  "message": "Validation failed",
  "status": 400,
  "details": [{ "field": "q", "message": "must not be blank" }]
}
```

`GET /api/movies/999999999`:
```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "movie 999999999 not found",
  "status": 404
}
```

`POST /api/movies/popular`:
```json
{
  "code": "METHOD_NOT_ALLOWED",
  "message": "Request method 'POST' is not supported",
  "status": 405
}
```

`GET /api/this-route-does-not-exist`:
```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "No endpoint GET /api/this-route-does-not-exist.",
  "status": 404
}
```

Any uncaught exception:
```json
{
  "code": "INTERNAL_ERROR",
  "message": "Internal server error",
  "status": 500
}
```
(The real cause is in the server log, never in the body.)

## Out of scope (deferred)

- RFC 9457 `ProblemDetail` content type (`application/problem+json`). The current shape can be wrapped as a `ProblemDetail` extension later if a public-API consumer asks.
- `traceId` field — pending OpenTelemetry / MDC integration.
- i18n of `message`.
- OpenAPI documentation of the per-endpoint error catalog — pending springdoc adoption.
- 401 / 403 — arrive with the Keycloak card.
