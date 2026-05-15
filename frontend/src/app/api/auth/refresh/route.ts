import { NextResponse } from "next/server";
import { keycloakConfig, tokenUrl } from "@/lib/auth/keycloak";
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from "@/lib/auth/cookies";
import { sessionStore } from "@/lib/auth/store";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in: number;
}

export async function POST() {
  const sessionId = await readSessionCookie();
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }
  const record = await sessionStore().read(sessionId);
  if (!record) {
    await clearSessionCookie();
    return NextResponse.json({ error: "session_gone" }, { status: 401 });
  }

  const { clientId } = keycloakConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: record.refreshToken,
  });

  const response = await fetch(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    await sessionStore().destroy(sessionId);
    await clearSessionCookie();
    return NextResponse.json({ error: "refresh_failed" }, { status: 401 });
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
    return NextResponse.json({ error: "session_expired_max" }, { status: 401 });
  }

  // Refresh the cookie's maxAge to mirror the new refresh window.
  await setSessionCookie(sessionId, tokens.refresh_expires_in);
  return NextResponse.json({ ok: true });
}
