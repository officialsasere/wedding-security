import { all, settings } from "@/lib/sheets"; import { dec } from "@/lib/util"; import QRCode from "qrcode"; import { notFound } from "next/navigation";
import InvitationCard from "@/components/InvitationCard";
export const dynamic = "force-dynamic";
export default async function Inv({ params }: { params: { token: string } }) {
  const inv = (await all("Invitations")).find((i) => i.token === params.token); if (!inv || inv.status === "Revoked") notFound();
  const reg = (await all("Registrations")).find((r) => r.id === inv.registrationId)!; const s = await settings();
  const qr = await QRCode.toDataURL(`${process.env.APP_URL}/invitation/${inv.token}`, { width: 320, margin: 1 });
  return <main className="mx-auto max-w-md p-5"><InvitationCard d={{ coupleNames: s.coupleNames, guestName: reg.fullName, approvedCount: inv.approvedCount, weddingDate: s.weddingDate, weddingTime: s.weddingTime, venue: s.venue, venueAddress: s.venueAddress, qr, accessCode: dec(inv.accessCodeEnc), ref: reg.id }} /></main>;
}
