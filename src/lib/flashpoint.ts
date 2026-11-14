// Owner: P1. Minimal Flashpoint MCP client (server-only): Streamable HTTP JSON-RPC to
// https://api.flashpoint.ai/mcp with the user's OAuth bearer token.
// Uses node:https rather than fetch because tool_survey can take up to 10 minutes, longer than
// fetch's built-in 5-minute header timeout.
import "server-only";
import https from "node:https";
import { FLASHPOINT_BASE, forgetFlashpointToken } from "./flashpoint-auth";

const MCP_URL = new URL(`${FLASHPOINT_BASE}/mcp`);
const PROTOCOL_VERSION = "2025-06-18";
const CALL_TIMEOUT_MS = 15 * 60_000;

export class FlashpointError extends Error {
  constructor(
    message: string,
    public readonly authFailed = false,
  ) {
    super(message);
  }
}

type RpcMessage = { jsonrpc: "2.0"; id?: number; result?: unknown; error?: { message?: string } };

function post(
  token: string,
  body: unknown,
  sessionId?: string,
): Promise<{ status: number; sessionId?: string; messages: RpcMessage[] }> {
  const payload = JSON.stringify(body);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
    "MCP-Protocol-Version": PROTOCOL_VERSION,
    "Content-Length": String(Buffer.byteLength(payload)),
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;
  const wantId = (body as { id?: number }).id;

  return new Promise((resolve, reject) => {
    const req = https.request(MCP_URL, { method: "POST", headers }, (res) => {
      const status = res.statusCode ?? 0;
      const sid = res.headers["mcp-session-id"];
      const isSse = String(res.headers["content-type"] ?? "").includes("text/event-stream");
      let buf = "";
      const messages: RpcMessage[] = [];
      const finish = () =>
        resolve({ status, sessionId: Array.isArray(sid) ? sid[0] : sid, messages });

      res.setEncoding("utf8");
      res.on("data", (chunk: string) => {
        buf += chunk;
        if (!isSse) return;
        // SSE: events are separated by a blank line; each "data:" line holds JSON-RPC.
        let idx;
        while ((idx = buf.search(/\r?\n\r?\n/)) !== -1) {
          const event = buf.slice(0, idx);
          buf = buf.slice(idx).replace(/^\r?\n\r?\n/, "");
          const data = event
            .split(/\r?\n/)
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trimStart())
            .join("\n");
          if (!data) continue;
          try {
            const msg = JSON.parse(data) as RpcMessage;
            messages.push(msg);
            // The response we asked for has arrived; don't wait for the server to close the stream.
            if (wantId !== undefined && msg.id === wantId) {
              res.destroy();
              finish();
              return;
            }
          } catch {
            /* ignore non-JSON keepalives */
          }
        }
      });
      res.on("end", () => {
        if (!isSse && buf.trim()) {
          try {
            const parsed = JSON.parse(buf) as RpcMessage | RpcMessage[];
            messages.push(...(Array.isArray(parsed) ? parsed : [parsed]));
          } catch {
            /* non-JSON error body */
          }
        }
        finish();
      });
      res.on("error", reject);
    });
    req.setTimeout(CALL_TIMEOUT_MS, () => req.destroy(new FlashpointError("Flashpoint call timed out")));
    req.on("error", reject);
    req.end(payload);
  });
}

async function checkAuth(status: number) {
  if (status === 401 || status === 403) {
    await forgetFlashpointToken();
    throw new FlashpointError("Flashpoint sign-in expired or was rejected. Connect Flashpoint again.", true);
  }
}

/** Calls one Flashpoint MCP tool in a fresh session and returns its structured result (or text). */
export async function callTool(token: string, name: string, args: Record<string, unknown>): Promise<unknown> {
  const init = await post(token, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "blindspot-ai", version: "0.1.0" },
    },
  });
  await checkAuth(init.status);
  if (init.status >= 400) throw new FlashpointError(`Flashpoint MCP initialize failed (${init.status})`);
  const sessionId = init.sessionId;
  await post(token, { jsonrpc: "2.0", method: "notifications/initialized" }, sessionId);

  const res = await post(token, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } }, sessionId);
  await checkAuth(res.status);
  const msg = res.messages.find((m) => m.id === 2);
  if (!msg) throw new FlashpointError(`Flashpoint ${name} returned no response (${res.status})`);
  if (msg.error) throw new FlashpointError(`Flashpoint ${name} failed: ${msg.error.message ?? "unknown error"}`);

  const result = msg.result as {
    isError?: boolean;
    structuredContent?: unknown;
    content?: { type: string; text?: string }[];
  };
  const text = (result.content ?? []).filter((c) => c.type === "text" && c.text).map((c) => c.text).join("\n");
  if (result.isError) throw new FlashpointError(`Flashpoint ${name} failed: ${text.slice(0, 300) || "unknown error"}`);
  if (result.structuredContent !== undefined) return result.structuredContent;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** First value of `key` anywhere in a nested result (Flashpoint result blobs vary in shape). */
export function findKey(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") {
    if (typeof value === "string") {
      try {
        return findKey(JSON.parse(value), key);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
  if (!Array.isArray(value) && key in value) return (value as Record<string, unknown>)[key];
  for (const v of Object.values(value)) {
    const found = findKey(v, key);
    if (found !== undefined) return found;
  }
  return undefined;
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** An id field by key, or else a UUID written right after the key name in the reply text. */
export function findId(value: unknown, key: string): string | undefined {
  const direct = findKey(value, key);
  if (typeof direct === "string" && direct) return direct;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const near = new RegExp(`${key.replace("_", "[_ ]?")}\\W{0,12}(${UUID.source})`, "i").exec(text);
  return near?.[1];
}

export const replyText = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value, null, 2));
