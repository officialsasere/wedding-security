import { all, add, patch } from "@/lib/sheets"; import { handle, need, HttpError } from "@/lib/auth"; import { uid, now, locked } from "@/lib/util"; import { audit } from "@/lib/audit";
export const POST = (req: Request) => handle(async () => {
  const me = await need("security"); const { invitationId, count, key, method } = await req.json(); const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || !key) throw new HttpError(400, "Enter how many people are arriving.");
  return locked(async () => {
    const prior = (await all("Checkins")).find((c) => c.idempotencyKey === key); if (prior) return { ok: true, duplicate: true, admitted: Number(prior.admitted) };
    const inv = (await all("Invitations")).find((i) => i.id === invitationId); if (!inv) throw new HttpError(404, "Invalid invitation");
    const reg = (await all("Registrations")).find((r) => r.id === inv.registrationId);
    if (inv.status === "Revoked" || reg?.status !== "Approved") throw new HttpError(403, "Invitation is not valid for entry.");
    const used = Number(inv.checkedInCount), approved = Number(inv.approvedCount), left = approved - used;
    if (n > left) { await audit(me.sub, "checkin_blocked", "invitation", inv.id, `tried ${n}, left ${left}`); throw new HttpError(409, `Only ${left} slot(s) remain. Administrator authorization is required for more.`); }
    await add("Checkins", { id: uid("chk"), invitationId: inv.id, registrationId: inv.registrationId, admitted: String(n), securityId: me.sub, timestamp: now(), method: method ?? "qr", status: "Success", idempotencyKey: key });
    await patch("Invitations", inv.id, { checkedInCount: String(used + n), remainingCount: String(left - n), status: used + n >= approved ? "Fully Checked In" : "Partially Checked In" });
    return { ok: true, admitted: n, remaining: left - n };
  });
});
