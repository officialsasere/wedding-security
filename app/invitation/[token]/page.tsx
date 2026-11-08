import { all, settings } from "@/lib/sheets"; import { dec } from "@/lib/util"; import QRCode from "qrcode"; import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Inv({ params }: { params: { token: string } }) {
  const inv = (await all("Invitations")).find((i) => i.token === params.token); if (!inv || inv.status === "Revoked") notFound();
  const reg = (await all("Registrations")).find((r) => r.id === inv.registrationId)!; const s = await settings();
  const qr = await QRCode.toDataURL(`${process.env.APP_URL}/invitation/${inv.token}`, { width: 320, margin: 1 });
  return <main className="mx-auto max-w-md p-5"><div className="rounded-2xl border-4 border-double border-gold bg-white p-8 text-center">
    <p>Together with their families</p><h1 className="mt-3 font-serif text-4xl">{s.coupleNames}</h1><p className="mt-3">invite</p><p className="font-serif text-2xl">{reg.fullName}</p>
    <p className="mt-1">Admits up to {inv.approvedCount}</p><p className="mt-5">{s.weddingDate} at {s.weddingTime}<br />{s.venue}<br />{s.venueAddress}</p>
    {/* eslint-disable-next-line @next/next/no-img-element */}<img src={qr} alt="Entry QR code" className="mx-auto mt-6 h-56 w-56" /><p className="mt-3 font-mono text-2xl tracking-widest">{dec(inv.accessCodeEnc)}</p><p className="mt-1 text-sm">Ref {reg.id}</p>
    <a download="invitation.png" href={qr} className="btn2 mt-5 inline-block">Save QR code</a></div></main>;
}
