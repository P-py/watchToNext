import "server-only";
import Redis from "ioredis";

declare global {
  // Hot-reload safety: keep one client across Next dev reloads.
  var __authRedis: Redis | undefined;
}

function makeClient(): Redis {
  const url = process.env.AUTH_REDIS_URL;
  if (!url) throw new Error("Missing required env var: AUTH_REDIS_URL");
  const client = new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
  client.on("error", (err) => {
    console.error("[auth-redis] connection error:", err.message);
  });
  return client;
}

export function authRedis(): Redis {
  if (!globalThis.__authRedis) {
    globalThis.__authRedis = makeClient();
  }
  return globalThis.__authRedis;
}
