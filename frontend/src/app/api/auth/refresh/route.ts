import { NextResponse } from "next/server";
import { refreshCurrentSession } from "@/lib/auth/refresh";

export async function POST() {
  const outcome = await refreshCurrentSession();
  if (outcome === "ok") {
    return NextResponse.json({ ok: true });
  }
  // Keycloak unreachable is a transient upstream failure, not an auth failure.
  const status = outcome === "refresh_unavailable" ? 502 : 401;
  return NextResponse.json({ error: outcome }, { status });
}
