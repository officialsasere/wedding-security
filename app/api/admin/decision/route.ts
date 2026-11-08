import { patch, all } from "@/lib/sheets"; import { handle, need, HttpError } from "@/lib/auth"; import { now } from "@/lib/util"; import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email"; import { issueInvitation, emailParams, resend } from "@/lib/invites";
export const POST = (req: Request) => handle(async () => {
  const me = await need("admin"); const { id, action, count, note } = await req.json();
  const reg = (await all("Registrations")).find((r) => r.id === id); if (!reg) throw new HttpError(404, "Registration not found");
  const inv = (await all("Invitations")).find((i) => i.registrationId === id);
  if (action === "approve") {
    if (reg.status === "Approved" && inv) throw new HttpError(409, "Already approved. Use resend.");
    const c = Math.max(1, Math.min(Number(count) || Number(reg.totalRequested), 50));
    const r = await patch("Registrations", id, { status: "Approved", approvedCount: String(c), reviewedBy: me.sub, reviewedAt: now(), adminNote: note ?? "" });
    const i = inv ?? (await issueInvitation(r, c)); await audit(me.sub, "approve", "registration", id, `count ${c}`);
    return { emailed: await sendEmail("approved", r.email, await emailParams(r, i), id) };
  }
  if (action === "reject") { await patch("Registrations", id, { status: "Rejected", reviewedBy: me.sub, reviewedAt: now(), adminNote: note ?? "" }); await audit(me.sub, "reject", "registration", id, note ?? ""); return { ok: true }; }
  if (action === "revoke") { if (!inv) throw new HttpError(404, "No invitation"); await patch("Invitations", inv.id, { status: "Revoked", revokedAt: now() }); await audit(me.sub, "revoke", "invitation", inv.id); return { ok: true }; }
  if (action === "resend") { await audit(me.sub, "resend", "registration", id); return { emailed: await resend(reg) }; }
  throw new HttpError(400, "Unknown action");
});