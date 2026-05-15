import { NextRequest, NextResponse } from "next/server";
import { callbackUrl, keycloakConfig, tokenUrl } from "@/lib/auth/keycloak";
import {
  clearTempAuthCookies,
  readStateCookie,
  readVerifierCookie,
  setSessionCookie,
} from "@/lib/auth/cookies";
import { verifyAndExtractIdentity } from "@/lib/auth/session";
import { sessionStore } from "@/lib/auth/store";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in: number;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const kcActionStatus = request.nextUrl.searchParams.get("kc_action_status");

  if (kcActionStatus === "error") {
    console.warn("[callback] kc_action_status=error — Keycloak signalled the action did not complete");
    await clearTempAuthCookies();
    return NextResponse.redirect(new URL("/signup?error=kc_action_error", request.url));
  }

  if (error) {
    await clearTempAuthCookies();
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code || !state) {
    await clearTempAuthCookies();
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const expectedState = await readStateCookie();
  const verifier = await readVerifierCookie();

  if (!expectedState || expectedState !== state || !verifier) {
    await clearTempAuthCookies();
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  const { clientId } = keycloakConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: callbackUrl(),
    code_verifier: verifier,
  });

  const tokenResponse = await fetch(tokenUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  await clearTempAuthCookies();

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;
  if (!tokens.id_token) {
    return NextResponse.redirect(new URL("/login?error=missing_id_token", request.url));
  }

  const identity = await verifyAndExtractIdentity(tokens.id_token);
  if (!identity) {
    return NextResponse.redirect(new URL("/login?error=invalid_id_token", request.url));
  }

  const { sessionId, ttlSeconds } = await sessionStore().create({
    identity,
    tokens: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      accessExpiresInSeconds: tokens.expires_in,
      refreshExpiresInSeconds: tokens.refresh_expires_in,
    },
  });
  await setSessionCookie(sessionId, ttlSeconds);

  return NextResponse.redirect(new URL("/", request.url));
}
