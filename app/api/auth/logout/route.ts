import { NextResponse } from "next/server";
import { sameOrigin } from "../../../lib/config";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set("bnp-admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
  return r;
}
