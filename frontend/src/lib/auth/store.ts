import "server-only";
import { randomBytes } from "node:crypto";
import { authRedis } from "./redis";
import { decryptPayload, encryptPayload } from "./crypto";

export interface SessionRecord {
  sub: string;
  displayName: string;
  email: string | null;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessExpiresAt: number; // epoch seconds
  refreshExpiresAt: number; // epoch seconds
  createdAt: number;
  lastAccessedAt: number;
}

const KEY_PREFIX = "wtn:session:";

function key(id: string): string {
  return `${KEY_PREFIX}${id}`;
}

function newSessionId(): string {
  return randomBytes(32).toString("base64url");
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function maxLifespanSeconds(): number {
  const fromEnv = Number.parseInt(process.env.SESSION_MAX_LIFESPAN_SECONDS ?? "", 10);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 36_000; // 10h default
}

interface CreateInput {
  identity: Pick<SessionRecord, "sub" | "displayName" | "email" | "roles">;
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    accessExpiresInSeconds: number;
    refreshExpiresInSeconds: number;
  };
}

export interface SessionStore {
  create(input: CreateInput): Promise<{ sessionId: string; record: SessionRecord; ttlSeconds: number }>;
  read(sessionId: string): Promise<SessionRecord | null>;
  updateTokens(sessionId: string, tokens: CreateInput["tokens"]): Promise<SessionRecord | null>;
  destroy(sessionId: string): Promise<void>;
}

class RedisSessionStore implements SessionStore {
  async create({ identity, tokens }: CreateInput) {
    const sessionId = newSessionId();
    const now = nowSeconds();
    const record: SessionRecord = {
      ...identity,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      accessExpiresAt: now + tokens.accessExpiresInSeconds,
      refreshExpiresAt: now + tokens.refreshExpiresInSeconds,
      createdAt: now,
      lastAccessedAt: now,
    };
    const ttl = Math.min(tokens.refreshExpiresInSeconds, maxLifespanSeconds());
    await authRedis().set(key(sessionId), encryptPayload(JSON.stringify(record)), "EX", ttl);
    return { sessionId, record, ttlSeconds: ttl };
  }

  async read(sessionId: string): Promise<SessionRecord | null> {
    if (!sessionId) return null;
    const raw = await authRedis().get(key(sessionId));
    if (!raw) return null;
    let record: SessionRecord;
    try {
      record = JSON.parse(decryptPayload(raw)) as SessionRecord;
    } catch (err) {
      // Corrupt / tampered / wrong key — drop and treat as gone.
      console.warn("[store.read] failed to decrypt session, dropping:", err instanceof Error ? err.message : err);
      await authRedis().del(key(sessionId));
      return null;
    }
    // Absolute cap, regardless of refresh window.
    if (record.createdAt + maxLifespanSeconds() < nowSeconds()) {
      await authRedis().del(key(sessionId));
      return null;
    }
    return record;
  }

  async updateTokens(sessionId: string, tokens: CreateInput["tokens"]): Promise<SessionRecord | null> {
    const existing = await this.read(sessionId);
    if (!existing) return null;
    const now = nowSeconds();
    const updated: SessionRecord = {
      ...existing,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      accessExpiresAt: now + tokens.accessExpiresInSeconds,
      refreshExpiresAt: now + tokens.refreshExpiresInSeconds,
      lastAccessedAt: now,
    };
    const remainingAbsolute = existing.createdAt + maxLifespanSeconds() - now;
    const ttl = Math.min(tokens.refreshExpiresInSeconds, Math.max(remainingAbsolute, 0));
    if (ttl <= 0) {
      await authRedis().del(key(sessionId));
      return null;
    }
    await authRedis().set(key(sessionId), encryptPayload(JSON.stringify(updated)), "EX", ttl);
    return updated;
  }

  async destroy(sessionId: string): Promise<void> {
    if (!sessionId) return;
    await authRedis().del(key(sessionId));
  }
}

let cachedStore: SessionStore | null = null;

export function sessionStore(): SessionStore {
  if (!cachedStore) cachedStore = new RedisSessionStore();
  return cachedStore;
}
