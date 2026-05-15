import "server-only";
import { randomBytes, createHash } from "node:crypto";

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateVerifier(): string {
  // RFC 7636 §4.1: 43–128 chars from the base64url alphabet. 32 bytes yields 43 chars.
  return base64UrlEncode(randomBytes(32));
}

export function deriveChallenge(verifier: string): string {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

export function generateState(): string {
  return base64UrlEncode(randomBytes(16));
}
