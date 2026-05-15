import { NextResponse } from "next/server";
import { authorizationUrl, callbackUrl, keycloakConfig } from "@/lib/auth/keycloak";
import { deriveChallenge, generateState, generateVerifier } from "@/lib/auth/pkce";
import { setTempAuthCookies } from "@/lib/auth/cookies";

interface BuildOptions {
  endpoint: string;
  /** When set, forwarded as the OIDC `prompt` parameter (`login` forces re-auth). */
  prompt?: "login" | "none" | "consent" | "select_account";
}

export async function buildAuthRedirect({ endpoint, prompt }: BuildOptions): Promise<URL> {
  const { clientId } = keycloakConfig();
  const verifier = generateVerifier();
  const state = generateState();
  const challenge = deriveChallenge(verifier);

  await setTempAuthCookies(verifier, state);

  const url = new URL(endpoint);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl());
  url.searchParams.set("response_type", "code");
  // Keycloak 26 emits a lean access token when only `openid` is requested
  // (no `sub`, `email`, `preferred_username`). Adding `profile` and `email`
  // brings the identity claims back into the access token via the default
  // scope mappers — backend + frontend both rely on `sub`.
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (prompt) url.searchParams.set("prompt", prompt);
  return url;
}

// Login flow: force the login screen even if there's an SSO cookie, so users
// who clicked "Entrar" always see the form instead of being auto-logged-in.
export async function GET() {
  const target = await buildAuthRedirect({
    endpoint: authorizationUrl(),
    prompt: "login",
  });
  return NextResponse.redirect(target);
}
