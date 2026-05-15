import "server-only";
import { redirect } from "next/navigation";
import { readSession } from "./session";
import type { Session } from "./types";

/**
 * Require an authenticated session in a server component or route handler.
 * Redirects to `redirectTo` when there is no session — the redirect throws,
 * so the caller can treat the return as `Session` (never null).
 */
export async function requireSession(redirectTo: string = "/login"): Promise<Session> {
  const session = await readSession();
  if (!session) redirect(redirectTo);
  return session;
}

/**
 * Bounce an already-authenticated user away from a public page (login, signup).
 * No-op when the user is anonymous.
 */
export async function redirectIfAuthenticated(target: string = "/"): Promise<void> {
  const session = await readSession();
  if (session) redirect(target);
}
