import bcrypt from "bcryptjs"; import { z } from "zod"; import { all, add, patch } from "@/lib/sheets"; import { handle, need, HttpError } from "@/lib/auth"; import { uid, now } from "@/lib/util"; import { audit } from "@/lib/audit";
export const dynamic = "force-dynamic";
export const GET = () => handle(async () => { await need("admin"); return (await all("Users")).filter((u) => u.role === "security").map(({ passwordHash, ...u }) => u); });
export const POST = (req: Request) => handle(async () => {
  const me = await need("admin"); const b = await req.json();
  if (b.toggle) { const u = (await all("Users")).find((x) => x.id === b.toggle && x.role === "security"); if (!u) throw new HttpError(404, "Not found"); await patch("Users", u.id, { status: u.status === "Active" ? "Inactive" : "Active", updatedAt: now() }); return { ok: true }; }
  const d = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(8) }).parse(b);
  if ((await all("Users")).some((u) => u.email.toLowerCase() === d.email.toLowerCase())) throw new HttpError(409, "Email in use");
  const id = uid("usr"); await add("Users", { id, fullName: d.fullName, email: d.email, passwordHash: await bcrypt.hash(d.password, 10), role: "security", status: "Active", createdAt: now(), updatedAt: now() });
  await audit(me.sub, "create_security", "user", id); return { id };
});
