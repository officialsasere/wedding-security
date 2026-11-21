import { headers } from "next/headers"; import QRCode from "qrcode";
import { all, settings } from "@/lib/sheets"; import { handle, HttpError } from "@/lib/auth"; import { limited, dec } from "@/lib/util";
export const dynamic = "force-dynamic";
// Look up by reference (REG-…), email OR phone. Any fields given must all match.
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
// +234 801… and 0801… are the same number: compare the last 10 digits
const samePhone = (a: string, b: string) => a.length >= 7 && b.length >= 7 && a.slice(-10) === b.slice(-10);
export const POST = (req: Request) => handle(async () => {
  if (limited("st:" + (headers().get("x-forwarded-for") ?? "ip"), 10)) throw new HttpError(429, "Too many attempts.");
  const b = await req.json();
  const rid = String(b.id ?? "").replace(/\s/g, "").toUpperCase(), em = String(b.email ?? "").trim().toLowerCase();
  const ph = digits(b.phone);
  if (!rid && !em && !ph) throw new HttpError(400, "Enter your reference, registered email or phone number.");
  if (ph && ph.length < 7) throw new HttpError(400, "Enter a valid phone number.");
  const matches = (await all("Registrations")).filter((x) => (!rid || x.id.toUpperCase() === rid) && (!em || x.email.toLowerCase() === em) && (!ph || samePhone(digits(x.phone), ph)));
  // an email can appear twice (rejected, then registered again): prefer the latest non-rejected one
  const r = [...matches].reverse().find((x) => x.status !== "Rejected") ?? matches[matches.length - 1];
  if (!r) throw new HttpError(404, "No registration matches those details.");
  const inv = (await all("Invitations")).find((i) => i.registrationId === r.id);
  const active = r.status === "Approved" && inv && inv.status !== "Revoked";
  let invitation = null;
  if (active) {
    const s = await settings();
    invitation = {
      coupleNames: s.coupleNames, guestName: r.fullName, approvedCount: inv.approvedCount, weddingDate: s.weddingDate, weddingTime: s.weddingTime,
      venue: s.venue, venueAddress: s.venueAddress, ref: r.id, accessCode: dec(inv.accessCodeEnc),
      qr: await QRCode.toDataURL(`${process.env.APP_URL}/invitation/${inv.token}`, { width: 320, margin: 1 }),
    };
  }
  return { status: inv?.status === "Revoked" ? "Invitation Revoked" : r.status, invitation };
});
