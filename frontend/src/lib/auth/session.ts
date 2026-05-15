import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { issuer, keycloakConfig } from "./keycloak";
import { readSessionCookie } from "./cookies";
import { sessionStore, type SessionRecord } from "./store";
import type { Session } from "./types";

export type { Session };

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function jwks() {
  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(keycloakConfig().jwksUrl));
  }
  return cachedJwks;
}

interface RealmAccessClaim {
  roles?: unknown;
}

function extractRoles(payload: JWTPayload): string[] {
  const realmAccess = payload["realm_access"] as RealmAccessClaim | undefined;
  const roles = realmAccess?.roles;
  if (!Array.isArray(roles)) return [];
  return roles.filter((r): r is string => typeof r === "string");
}

function resolveDisplayName(payload: JWTPayload, sub: string): string {
  const preferredUsername = payload["preferred_username"];
  if (typeof preferredUsername === "string" && preferredUsername.length > 0) return preferredUsername;
  const name = payload["name"];
  if (typeof name === "string" && name.length > 0) return name;
  return `user-${sub.slice(0, 8)}`;
}

export interface IdentityFromIdToken {
  sub: string;
  displayName: string;
  email: string | null;
  roles: string[];
}

/**
 * Verifies the id_token signature and extracts identity from it. Used at session
 * creation (callback) and refresh, when Keycloak hands us a fresh id_token. We
 * verify once here; subsequent reads pull identity from the Redis-backed store
 * without re-verifying.
 */
export async function verifyAndExtractIdentity(idToken: string): Promise<IdentityFromIdToken | null> {
  try {
    const { payload } = await jwtVerify(idToken, jwks(), { issuer: issuer() });
    if (!payload.sub) return null;
    const email = payload["email"];
    return {
      sub: payload.sub,
      displayName: resolveDisplayName(payload, payload.sub),
      email: typeof email === "string" ? email : null,
      roles: extractRoles(payload),
    };
  } catch (err) {
    console.error("[verifyAndExtractIdentity] verify failed:", err instanceof Error ? `${err.name}: ${err.message}` : err);
    return null;
  }
}

/** Public identity for the current user, or null. Reads cookie → session store. */
export async function readSession(): Promise<Session | null> {
  const sessionId = await readSessionCookie();
  if (!sessionId) return null;
  const record = await sessionStore().read(sessionId);
  if (!record) return null;
  return {
    sub: record.sub,
    displayName: record.displayName,
    email: record.email,
    roles: record.roles,
  };
}

/** Full session record incl. tokens — only callable from server-side route handlers. */
export async function readSessionRecord(): Promise<SessionRecord | null> {
  const sessionId = await readSessionCookie();
  if (!sessionId) return null;
  return sessionStore().read(sessionId);
}
