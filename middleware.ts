import { NextRequest, NextResponse } from "next/server"; import { jwtVerify } from "jose";
export async function middleware(req: NextRequest) {
  const need = req.nextUrl.pathname.startsWith("/admin") ? "admin" : "security";
  try { const { payload } = await jwtVerify(req.cookies.get("session")?.value ?? "", new TextEncoder().encode(process.env.JWT_SECRET)); if (payload.role === need || payload.role === "admin" && need === "security") return NextResponse.next(); } catch {}
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/admin/:path*", "/security/:path*"] };
