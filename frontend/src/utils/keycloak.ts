const ENV_VARS = {
  baseUrl: "NEXT_PUBLIC_KEYCLOAK_BASE_URL",
  realm: "NEXT_PUBLIC_KEYCLOAK_REALM",
  clientId: "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID",
  redirectUri: "NEXT_PUBLIC_AUTH_REDIRECT_URI",
} as const;

interface KeycloakConfig {
  baseUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
}

const PKCE_VERIFIER_STORAGE_KEY = "watchtonext.pkce.verifier";

function readConfig(): KeycloakConfig {
  const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI;

  const missing: string[] = [];
  if (!baseUrl) missing.push(ENV_VARS.baseUrl);
  if (!realm) missing.push(ENV_VARS.realm);
  if (!clientId) missing.push(ENV_VARS.clientId);
  if (!redirectUri) missing.push(ENV_VARS.redirectUri);

  if (missing.length > 0) {
    throw new Error(`Missing Keycloak env var(s): ${missing.join(", ")}`);
  }

  return {
    baseUrl: baseUrl!.replace(/\/$/, ""),
    realm: realm!,
    clientId: clientId!,
    redirectUri: redirectUri!,
  };
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  // RFC 7636: 43–128 chars, base64url alphabet. 32 bytes = 43 chars after base64url.
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  return base64UrlEncode(random);
}

async function deriveCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export async function buildKeycloakRegisterUrl(): Promise<string> {
  const { baseUrl, realm, clientId, redirectUri } = readConfig();

  const verifier = generateCodeVerifier();
  const challenge = await deriveCodeChallenge(verifier);
  sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid",
    kc_action: "REGISTER",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${baseUrl}/realms/${encodeURIComponent(realm)}/protocol/openid-connect/registrations?${params.toString()}`;
}

export { PKCE_VERIFIER_STORAGE_KEY };
