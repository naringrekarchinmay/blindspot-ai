import { NextResponse } from "next/server";
import { completeAuthorization } from "@/lib/flashpoint-auth";

// Flashpoint redirects here after sign-in. Saves the token server-side, then tells the opener.
function page(ok: boolean, message: string) {
  const html = `<!doctype html><meta charset="utf-8"><title>Flashpoint</title>
<body style="font:15px system-ui;background:#0b1220;color:#e2e8f0;display:grid;place-items:center;height:100vh;margin:0">
<p>${message}</p>
<script>try{window.opener&&window.opener.postMessage({type:"flashpoint-auth",ok:${ok}},location.origin)}catch(e){}${ok ? "setTimeout(()=>window.close(),800)" : ""}</script></body>`;
  const res = new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  res.cookies.delete({ name: "fp_oauth", path: "/api/flashpoint" });
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = req.headers.get("cookie")?.match(/(?:^|;\s*)fp_oauth=([^;]+)/)?.[1];
  let saved: { verifier?: string; state?: string } = {};
  try {
    saved = cookie ? JSON.parse(decodeURIComponent(cookie)) : {};
  } catch {}
  if (url.searchParams.get("error")) return page(false, "Flashpoint sign-in was cancelled. You can close this window.");
  if (!code || !state || state !== saved.state || !saved.verifier) {
    return page(false, "Flashpoint sign-in couldn't be verified. Close this window and try again.");
  }
  try {
    await completeAuthorization(code, saved.verifier, `${url.origin}/api/flashpoint/callback`);
    return page(true, "Flashpoint connected. You can close this window.");
  } catch (err) {
    console.error(err);
    return page(false, "Flashpoint sign-in failed. Close this window and try again.");
  }
}
