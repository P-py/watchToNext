import { NextResponse } from "next/server";
import { registrationUrl } from "@/lib/auth/keycloak";
import { buildAuthRedirect } from "../login/route";

// Signup flow: hit Keycloak's `/registrations` endpoint, which renders the
// registration form natively. No `prompt=login` (that would short-circuit to
// the login screen) and no `kc_action` (REGISTER is not a Required Action).
export async function GET() {
  const target = await buildAuthRedirect({ endpoint: registrationUrl() });
  return NextResponse.redirect(target);
}
