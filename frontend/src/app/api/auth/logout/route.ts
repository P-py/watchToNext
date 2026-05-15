import { NextResponse } from "next/server";
import { endSessionUrl, keycloakConfig, postLogoutRedirectUrl } from "@/lib/auth/keycloak";
import { clearSessionCookie, readSessionCookie } from "@/lib/auth/cookies";
import { sessionStore } from "@/lib/auth/store";

async function buildLogoutFlow(): Promise<URL> {
  const sessionId = await readSessionCookie();
  let idTokenHint: string | undefined;
  if (sessionId) {
    const record = await sessionStore().read(sessionId);
    idTokenHint = record?.idToken;
    await sessionStore().destroy(sessionId);
  }
  const { clientId } = keycloakConfig();
  const url = new URL(endSessionUrl());
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUrl());
  if (idTokenHint) url.searchParams.set("id_token_hint", idTokenHint);
  return url;
}

export async function POST() {
  const target = await buildLogoutFlow();
  await clearSessionCookie();
  return NextResponse.redirect(target, { status: 303 });
}

export async function GET() {
  return POST();
}
