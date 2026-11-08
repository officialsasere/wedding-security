import { cookies, headers } from "next/headers"; import bcrypt from "bcryptjs";
import { all } from "@/lib/sheets"; import { handle, HttpError, sign } from "@/lib/auth"; import { limited } from "@/lib/util"; import { audit } from "@/lib/audit";
export const POST = (req: Request) => handle(async () => {
  if (limited("login:" + (headers().get("x-forwarded-for") ?? "ip"), 8, 300_000)) throw new HttpError(429, "Too many attempts.");
  const { email, password } = await req.json();
  const u = (await all("Users")).find((x) => x.email.toLowerCase() === String(email).toLowerCase());
  if (!u || u.status !== "Active" || !(await bcrypt.compare(String(password), u.passwordHash))) throw new HttpError(401, "Wrong email or password.");
  cookies().set("session", await sign({ sub: u.id, role: u.role as "admin", name: u.fullName }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 43200, path: "/" });
  await audit(u.id, "login", "user", u.id); return { role: u.role };
});
