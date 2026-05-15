import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function keycloakConfig() {
  return {
    baseUrl: required("NEXT_PUBLIC_KEYCLOAK_BASE_URL").replace(/\/$/, ""),
    realm: required("NEXT_PUBLIC_KEYCLOAK_REALM"),
    clientId: required("NEXT_PUBLIC_KEYCLOAK_CLIENT_ID"),
    redirectUri: required("NEXT_PUBLIC_AUTH_REDIRECT_URI"),
    jwksUrl: required("KEYCLOAK_JWKS_URL"),
  };
}

function realmRoot(): string {
  const { baseUrl, realm } = keycloakConfig();
  return `${baseUrl}/realms/${encodeURIComponent(realm)}`;
}

export function authorizationUrl(): string {
  return `${realmRoot()}/protocol/openid-connect/auth`;
}

export function registrationUrl(): string {
  return `${realmRoot()}/protocol/openid-connect/registrations`;
}

export function tokenUrl(): string {
  return `${realmRoot()}/protocol/openid-connect/token`;
}

export function endSessionUrl(): string {
  return `${realmRoot()}/protocol/openid-connect/logout`;
}

export function issuer(): string {
  return realmRoot();
}

/** Where Keycloak should send the browser back after auth — handled by callback route. */
export function callbackUrl(): string {
  return `${keycloakConfig().redirectUri.replace(/\/$/, "")}/api/auth/callback`;
}

/** Where Keycloak should send the browser after logout — the app home. */
export function postLogoutRedirectUrl(): string {
  return keycloakConfig().redirectUri;
}
