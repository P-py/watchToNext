import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM: 32-byte key, 12-byte nonce, 16-byte auth tag.
const KEY_BYTES = 32;
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const ALGORITHM = "aes-256-gcm";

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.SESSION_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "Missing required env var: SESSION_ENCRYPTION_KEY. Generate one with " +
        '`node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"`',
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `SESSION_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${buf.length}). ` +
        "Use a 32-byte key in base64.",
    );
  }
  cachedKey = buf;
  return buf;
}

/** Encrypts UTF-8 plaintext → base64url(nonce || ciphertext || tag). */
export function encryptPayload(plaintext: string): string {
  const key = loadKey();
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, ciphertext, tag]).toString("base64url");
}

/** Decrypts base64url(nonce || ciphertext || tag) → UTF-8 plaintext. Throws on tamper. */
export function decryptPayload(encoded: string): string {
  const key = loadKey();
  const buf = Buffer.from(encoded, "base64url");
  if (buf.length < NONCE_BYTES + TAG_BYTES) {
    throw new Error("ciphertext too short");
  }
  const nonce = buf.subarray(0, NONCE_BYTES);
  const tag = buf.subarray(buf.length - TAG_BYTES);
  const ciphertext = buf.subarray(NONCE_BYTES, buf.length - TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
