"use client"; import { useState } from "react";
export default function Status() {
  const [m, setM] = useState("");
  async function go(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const r = await fetch("/api/status", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) }); const j = await r.json();
    setM(!r.ok ? j.error : j.status === "Approved" ? `Approved. Your invitation: ${location.origin}${j.invitationUrl}` : j.status === "Pending Approval" ? "Still waiting for approval." : j.status === "Rejected" ? "Sorry, we couldn’t accommodate this registration." : "This invitation has been revoked. Please contact the couple."); }
  return <main className="mx-auto max-w-md px-5 py-12"><h1 className="font-serif text-3xl">Registration status</h1><form onSubmit={go} className="mt-6 space-y-4"><input className="inp" name="id" placeholder="Reference (REG-…)" required /><input className="inp" name="email" type="email" placeholder="Registered email" required /><button className="btn w-full">Check status</button></form>{m && <p className="mt-6 rounded-lg bg-white p-4 break-words">{m}</p>}</main>;
}
