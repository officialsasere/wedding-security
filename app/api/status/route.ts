import { headers } from "next/headers"; import { all } from "@/lib/sheets"; import { handle, HttpError } from "@/lib/auth"; import { limited } from "@/lib/util";
export const POST = (req: Request) => handle(async () => {
  if (limited("st:" + (headers().get("x-forwarded-for") ?? "ip"), 10)) throw new HttpError(429, "Too many attempts.");
  const { id, email } = await req.json();
  const r = (await all("Registrations")).find((x) => x.id === String(id).trim() && x.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!r) throw new HttpError(404, "No registration matches those details.");
  const inv = (await all("Invitations")).find((i) => i.registrationId === r.id);
  return { status: inv?.status === "Revoked" ? "Invitation Revoked" : r.status, invitationUrl: r.status === "Approved" && inv && inv.status !== "Revoked" ? `/invitation/${inv.token}` : null };
});
