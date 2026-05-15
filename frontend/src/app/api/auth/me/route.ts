import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";

// Returns 200 always: the session object when authenticated, `null` otherwise.
// The cookie is opaque and never leaves the BFF — this endpoint is the only
// place the browser learns *who* the user is, via identity claims only.
export async function GET() {
  const session = await readSession();
  return NextResponse.json(session);
}
