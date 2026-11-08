import QRCode from "qrcode";
import { all, add, patch, settings, Row } from "./sheets";
import { uid, now, genCode, genToken, hashCode, enc, dec } from "./util";
import { sendEmail } from "./email";
export async function emailParams(reg: Row, inv?: Row) {
  const s = await settings(); const base = process.env.APP_URL;
  return { guest_name: reg.fullName, registration_id: reg.id, couple_names: s.coupleNames ?? "", wedding_date: s.weddingDate ?? "", wedding_time: s.weddingTime ?? "", venue: `${s.venue ?? ""} ${s.venueAddress ?? ""}`.trim(),
    approved_guest_count: reg.approvedCount, ...(inv ? { access_code: dec(inv.accessCodeEnc), qr_code_url: `${base}/api/qr/${inv.token}`, invitation_url: `${base}/invitation/${inv.token}` } : {}) };
}
export async function issueInvitation(reg: Row, count: number) {
  const code = genCode(); const inv: Row = { id: uid("inv"), registrationId: reg.id, accessCodeHash: hashCode(code), token: genToken(), accessCodeEnc: enc(code), approvedCount: String(count), checkedInCount: "0", remainingCount: String(count), status: "Active", issuedAt: now(), revokedAt: "" };
  await add("Invitations", inv); return inv; // saved BEFORE email
}
export async function qrPng(token: string) { return QRCode.toBuffer(`${process.env.APP_URL}/invitation/${token}`, { width: 400, margin: 2 }); }
export async function resend(reg: Row) {
  const inv = (await all("Invitations")).find((i) => i.registrationId === reg.id && i.status !== "Revoked"); if (!inv) return false;
  return sendEmail("approved", reg.email, await emailParams({ ...reg }, inv), reg.id);
}
export { patch };
