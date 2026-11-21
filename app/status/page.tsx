"use client";
import { useState } from "react";
import InvitationCard, { InvitationData } from "@/components/InvitationCard";

export default function Status() {
  const [m, setM] = useState(""); const [inv, setInv] = useState<InvitationData | null>(null); const [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!f.id?.trim() && !f.email?.trim() && !f.phone?.trim()) { setInv(null); setM("Enter your reference, registered email or phone number."); return; }
    setBusy(true); setM(""); setInv(null);
    try {
      const r = await fetch("/api/status", { method: "POST", body: JSON.stringify(f) }); const j = await r.json();
      if (!r.ok) setM(j.error ?? "Something went wrong. Try again.");
      else if (j.invitation) setInv(j.invitation);
      else setM(j.status === "Pending Approval" ? "Still waiting for approval." : j.status === "Rejected" ? "Sorry, we couldn’t accommodate this registration." : j.status === "Invitation Revoked" ? "This invitation has been revoked. Please contact the couple." : `Status: ${j.status}`);
    } catch { setM("No connection. Please try again."); }
    setBusy(false);
  }
  return (
    <main className="mx-auto max-w-md px-5 py-12">
      <h1 className="font-serif text-3xl">Registration status</h1>
      <p className="mt-2 text-sm">Enter your reference, registered email <b>or</b> phone number.</p>
      <form onSubmit={go} className="mt-6 space-y-4" aria-busy={busy}>
        <input className="inp" name="id" placeholder="Reference (REG-…)" autoComplete="off" disabled={busy} />
        <p className="text-center text-sm">or</p>
        <input className="inp" name="email" type="email" placeholder="Registered email" disabled={busy} />
        <p className="text-center text-sm">or</p>
        <input className="inp" name="phone" type="tel" placeholder="Registered phone number" autoComplete="tel" disabled={busy} />
        <button className="btn w-full" disabled={busy}>{busy ? "Checking…" : "Check status"}</button>
      </form>
      {m && <p role="status" className="mt-6 break-words rounded-lg bg-white p-4">{m}</p>}
      {inv && <div className="mt-6"><InvitationCard d={inv} /></div>}
    </main>
  );
}
