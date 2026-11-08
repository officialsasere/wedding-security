import { z } from "zod"; import { headers } from "next/headers";
import { all, add, settings } from "@/lib/sheets"; import { handle, HttpError } from "@/lib/auth";
import { uid, now, limited } from "@/lib/util";
const S = z.object({ fullName: z.string().min(2).max(100), email: z.string().email(), phone: z.string().regex(/^\+?[0-9\s-]{7,16}$/, "Invalid phone"), relationship: z.enum(["Family","Friend","Colleague","Church","Other"]),
  additionalGuests: z.coerce.number().int().min(0).max(10), guestNames: z.string().max(500).optional().default(""), gift: z.string().max(300).optional().default(""), dietary: z.string().max(300).optional().default(""), requests: z.string().max(500).optional().default(""), notes: z.string().max(500).optional().default("") });
export const POST = (req: Request) => handle(async () => {
  if (limited("reg:" + (headers().get("x-forwarded-for") ?? "ip"), 5, 600_000)) throw new HttpError(429, "Too many attempts. Try again later.");
  const d = S.parse(await req.json()); const s = await settings();
  const t = Date.now(); if ((s.regOpen && t < Date.parse(s.regOpen)) || (s.regClose && t > Date.parse(s.regClose))) throw new HttpError(400, "Registration is closed.");
  const rows = await all("Registrations");
  if (rows.some((r) => r.email.toLowerCase() === d.email.toLowerCase() && r.status !== "Rejected")) throw new HttpError(409, "This email is already registered.");
  const reg = { id: "REG-" + uid("").slice(1, 9).toUpperCase(), ...d, additionalGuests: String(d.additionalGuests), totalRequested: String(d.additionalGuests + 1), status: "Pending Approval", approvedCount: "", registeredAt: now(), reviewedBy: "", reviewedAt: "", adminNote: "" };
  await add("Registrations", reg);
  return { id: reg.id };
});