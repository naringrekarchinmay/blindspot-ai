import { NextResponse } from "next/server";
import { beginAuthorization } from "@/lib/flashpoint-auth";

// GET (a browser navigation, unlike the JSON API): starts Flashpoint OAuth sign-in in a popup.
export async function GET(req: Request) {
  const redirectUri = `${new URL(req.url).origin}/api/flashpoint/callback`;
  try {
    const { url, verifier, state } = await beginAuthorization(redirectUri);
    const res = NextResponse.redirect(url);
    res.cookies.set("fp_oauth", JSON.stringify({ verifier, state }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/flashpoint",
      maxAge: 600,
    });
    return res;
  } catch (err) {
    console.error(err);
    return new NextResponse("Couldn't start Flashpoint sign-in. Check the server log.", { status: 502 });
  }
}
