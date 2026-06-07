import "server-only";
import { keycloakConfig, tokenUrl } from "./keycloak";
import { clearSessionCookie, readSessionCookie, setSessionCookie } from "./cookies";
import { sessionStore } from "./store";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in: number;
}

export type RefreshOutcome =
  | "ok"
  | "no_session"
  | "session_gone"
  | "refresh_failed"
  | "session_expired_max"
  | "refresh_unavailable";

/**
 * Refreshes the current session's tokens against Keycloak, using the session id
 * from the request's cookie. Returns a discriminated outcome instead of an HTTP
 * response so it can be called directly from any server-side context — the
 * `/api/auth/refresh` route handler *and* the proxy route — with no HTTP self-hop.
 *
 * Calling it in-process (rather than `fetch`-ing the route via `request.origin`)
 * avoids the platform-proxy footgun where the forwarded origin is `https://` but
 * the container bind is plain HTTP, producing `ERR_SSL_WRONG_VERSION_NUMBER`.
 *
 * A network failure reaching Keycloak yields `refresh_unavailable` and leaves the
 * session intact — only an explicit Keycloak rejection (`!response.ok`) destroys it.
 */
export async function refreshCurrentSession(): Promise<RefreshOutcome> {
  const sessionId = await readSessionCookie();
  if (!sessionId) return "no_session";

  const record = await sessionStore().read(sessionId);
  if (!record) {
    await clearSessionCookie();
    return "session_gone";
  }

  const { clientId } = keycloakConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: record.refreshToken,
  });

  let response: Response;
  try {
    response = await fetch(tokenUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (err) {
    // Transient network/TLS error reaching Keycloak — keep the session and let
    // the caller retry on a later request rather than logging the user out.
    console.error(
      "[refreshCurrentSession] token endpoint unreachable:",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
    return "refresh_unavailable";
  }

  if (!response.ok) {
    await sessionStore().destroy(sessionId);
    await clearSessionCookie();
    return "refresh_failed";
  }

  const tokens = (await response.json()) as TokenResponse;
  const updated = await sessionStore().updateTokens(sessionId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token ?? record.idToken,
    accessExpiresInSeconds: tokens.expires_in,
    refreshExpiresInSeconds: tokens.refresh_expires_in,
  });
  if (!updated) {
    await clearSessionCookie();
    return "session_expired_max";
  }

  // Refresh the cookie's maxAge to mirror the new refresh window.
  await setSessionCookie(sessionId, tokens.refresh_expires_in);
  return "ok";
}
