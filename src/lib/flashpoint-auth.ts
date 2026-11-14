// Owner: P1. Flashpoint OAuth (server-only): dynamic client registration + PKCE, as advertised at
// https://api.flashpoint.ai/.well-known/oauth-authorization-server. The token is kept in a
// git-ignored local file so it survives dev-server restarts, and never reaches the browser.
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const FLASHPOINT_BASE = "https://api.flashpoint.ai";
const AUTHORIZE_URL = `${FLASHPOINT_BASE}/oauth/authorize`;
const TOKEN_URL = `${FLASHPOINT_BASE}/oauth/token`;
const REGISTER_URL = `${FLASHPOINT_BASE}/oauth/register`;

const STORE_DIR = path.join(process.cwd(), ".flashpoint");
const STORE_FILE = path.join(STORE_DIR, "auth.json");

type Store = {
  /** Registered public client, keyed by redirect URI (dev and prod ports differ). */
  clients?: Record<string, string>;
  accessToken?: string;
  expiresAt?: number;
};

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(STORE_FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

/** FLASHPOINT_TOKEN in .env.local wins; otherwise the token saved by the sign-in flow. */
export async function getFlashpointToken(): Promise<string | null> {
  const env = process.env.FLASHPOINT_TOKEN?.trim();
  if (env) return env;
  const store = await readStore();
  if (!store.accessToken) return null;
  if (store.expiresAt && store.expiresAt < Date.now() + 60_000) return null;
  return store.accessToken;
}

/** Drop a saved token Flashpoint rejected, so the UI asks the user to connect again. */
export async function forgetFlashpointToken() {
  const store = await readStore();
  delete store.accessToken;
  delete store.expiresAt;
  await writeStore(store);
}

export async function disconnectFlashpoint() {
  await rm(STORE_FILE, { force: true });
}

async function clientIdFor(redirectUri: string): Promise<string> {
  const store = await readStore();
  const existing = store.clients?.[redirectUri];
  if (existing) return existing;
  const res = await fetch(REGISTER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "BlindSpot AI (local)",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  if (!res.ok) throw new Error(`Flashpoint client registration failed (${res.status})`);
  const { client_id } = (await res.json()) as { client_id?: string };
  if (!client_id) throw new Error("Flashpoint client registration returned no client_id");
  await writeStore({ ...store, clients: { ...store.clients, [redirectUri]: client_id } });
  return client_id;
}

const b64url = (buf: Buffer) => buf.toString("base64url");

/** Builds the authorize URL. The caller keeps `verifier` and `state` (httpOnly cookie) for the callback. */
export async function beginAuthorization(redirectUri: string) {
  const clientId = await clientIdFor(redirectUri);
  const verifier = b64url(randomBytes(32));
  const state = b64url(randomBytes(16));
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: b64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
    state,
    resource: `${FLASHPOINT_BASE}/mcp`,
  }).toString();
  return { url: url.toString(), verifier, state };
}

export async function completeAuthorization(code: string, verifier: string, redirectUri: string) {
  const clientId = await clientIdFor(redirectUri);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
      resource: `${FLASHPOINT_BASE}/mcp`,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Flashpoint token exchange failed (${res.status})`);
  const tok = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!tok.access_token) throw new Error("Flashpoint token exchange returned no access_token");
  const store = await readStore();
  await writeStore({
    ...store,
    accessToken: tok.access_token,
    expiresAt: tok.expires_in ? Date.now() + tok.expires_in * 1000 : undefined,
  });
}
