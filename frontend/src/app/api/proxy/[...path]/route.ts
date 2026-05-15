import { NextRequest, NextResponse } from "next/server";
import { readSessionRecord } from "@/lib/auth/session";

const FORWARD_BLOCKLIST = new Set([
  "host",
  "cookie",
  "connection",
  "content-length",
  "accept-encoding",
  "transfer-encoding",
]);

function upstreamBase(): string {
  const value = process.env.API_UPSTREAM_URL;
  if (!value) throw new Error("Missing required env var: API_UPSTREAM_URL");
  return value.replace(/\/$/, "");
}

function buildUpstreamUrl(request: NextRequest, path: string[]): string {
  const suffix = path.map((segment) => encodeURIComponent(segment)).join("/");
  const search = request.nextUrl.search;
  return `${upstreamBase()}/${suffix}${search}`;
}

function copyForwardableHeaders(source: Headers): Headers {
  const out = new Headers();
  source.forEach((value, key) => {
    if (!FORWARD_BLOCKLIST.has(key.toLowerCase())) out.set(key, value);
  });
  return out;
}

let pendingRefresh: Promise<boolean> | null = null;

async function tryRefresh(request: NextRequest): Promise<boolean> {
  if (!pendingRefresh) {
    pendingRefresh = (async () => {
      const refreshUrl = new URL("/api/auth/refresh", request.nextUrl.origin);
      const cookieHeader = request.headers.get("cookie") ?? "";
      const response = await fetch(refreshUrl, {
        method: "POST",
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
      return response.ok;
    })().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
}

async function forward(request: NextRequest, path: string[]): Promise<NextResponse> {
  const headers = copyForwardableHeaders(request.headers);
  const record = await readSessionRecord();
  if (record) headers.set("authorization", `Bearer ${record.accessToken}`);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(buildUpstreamUrl(request, path), init);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!FORWARD_BLOCKLIST.has(key.toLowerCase())) responseHeaders.set(key, value);
  });
  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;

  const first = await forward(request, path);
  if (first.status !== 401) return first;

  const refreshed = await tryRefresh(request);
  if (!refreshed) return first;
  return forward(request, path);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
