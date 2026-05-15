import "server-only";
import { cookies } from "next/headers";

export const COOKIE_SESSION = "wtn_session";
export const COOKIE_VERIFIER = "wtn_pkce_verifier";
export const COOKIE_STATE = "wtn_oauth_state";

export const CALLBACK_PATH = "/api/auth/callback";

const SHORT_LIVED_MAX_AGE = 600; // 5 min for verifier/state during one auth round-trip

function isSecure(): boolean {
  return process.env.AUTH_COOKIE_SECURE === "true";
}

export async function setTempAuthCookies(verifier: string, state: string): Promise<void> {
  const jar = await cookies();
  const common = {
    httpOnly: true,
    secure: isSecure(),
    sameSite: "lax" as const,
    path: CALLBACK_PATH,
    maxAge: SHORT_LIVED_MAX_AGE,
  };
  jar.set(COOKIE_VERIFIER, verifier, common);
  jar.set(COOKIE_STATE, state, common);
}

export async function clearTempAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_VERIFIER, "", { path: CALLBACK_PATH, maxAge: 0 });
  jar.set(COOKIE_STATE, "", { path: CALLBACK_PATH, maxAge: 0 });
}

export async function setSessionCookie(sessionId: string, maxAgeSeconds: number): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_SESSION, sessionId, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_SESSION, "", { path: "/", maxAge: 0 });
}

export async function readSessionCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE_SESSION)?.value ?? null;
}

export async function readVerifierCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE_VERIFIER)?.value ?? null;
}

export async function readStateCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE_STATE)?.value ?? null;
}
