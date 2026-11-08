import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type Session = { sub: string; role: "admin" | "security"; name: string };
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const sign = (s: Session) => new SignJWT({ ...s }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("12h").sign(secret());
export async function session(): Promise<Session | null> {
  const t = cookies().get("session")?.value; if (!t) return null;
  try { return (await jwtVerify(t, secret())).payload as unknown as Session; } catch { return null; }
}
export class HttpError extends Error { constructor(public status: number, m: string) { super(m); } }
export async function need(...roles: Session["role"][]) { const s = await session(); if (!s || !roles.includes(s.role)) throw new HttpError(s ? 403 : 401, "Not allowed"); return s; }
export async function handle(fn: () => Promise<unknown>) {
  try { return NextResponse.json(await fn()); }
  catch (e) { if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status }); console.error(e); return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 }); }
}
