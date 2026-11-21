export type InvitationData = {
  coupleNames?: string; guestName: string; approvedCount: string; weddingDate?: string; weddingTime?: string;
  venue?: string; venueAddress?: string; qr: string; accessCode: string; ref: string;
};

export default function InvitationCard({ d }: { d: InvitationData }) {
  return (
    <div className="rounded-2xl border-4 border-double border-gold bg-white p-8 text-center">
      <p>Together with their families</p>
      <h1 className="mt-3 font-serif text-4xl">{d.coupleNames}</h1>
      <p className="mt-3">invite</p>
      <p className="font-serif text-2xl">{d.guestName}</p>
      <p className="mt-1">Admits up to {d.approvedCount}</p>
      <p className="mt-5">{d.weddingDate} at {d.weddingTime}<br />{d.venue}<br />{d.venueAddress}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={d.qr} alt="Entry QR code" className="mx-auto mt-6 h-56 w-56" />
      <p className="mt-3 font-mono text-2xl tracking-widest">{d.accessCode}</p>
      <p className="mt-1 text-sm">Ref {d.ref}</p>
      <a download="invitation.png" href={d.qr} className="btn2 mt-5 inline-block">Save QR code</a>
    </div>
  );
}
