"use client";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";

export default function RegisterForm() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  function dismiss() { setRef(null); setCopied(false); setFormKey((k) => k + 1); }

  useEffect(() => {
    if (!ref) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/register", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
      const j = await r.json();
      if (r.ok) setRef(j.id);
      else toast("error", typeof j.error === "string" ? j.error : "Please check your details and try again.");
    } catch {
      toast("error", "No connection. Please try again.");
    }
    setBusy(false);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(ref!); setCopied(true); } catch {}
  }

  return (
    <>
      <form key={formKey} onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 md:p-8" aria-busy={busy}>
        <p className="text-sm">Fields marked * are required.</p>
        <input className="inp" name="fullName" placeholder="Full name *" required autoComplete="name" disabled={busy} />
        <input className="inp" name="email" type="email" placeholder="Email *" required autoComplete="email" disabled={busy} />
        <input className="inp" name="phone" type="tel" placeholder="Phone *" required autoComplete="tel" disabled={busy} />
        <select className="inp" name="relationship" required defaultValue="" disabled={busy}>
          <option value="" disabled>Relationship with the couple *</option>
          {["Family", "Friend", "Colleague", "Church", "Other"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <label className="block text-sm">How many people are coming with you? *
          <input className="inp mt-1" name="additionalGuests" type="number" min="0" max="10" defaultValue="0" required disabled={busy} />
        </label>
        <input className="inp" name="guestNames" placeholder="Names of people coming with you" disabled={busy} />
        <input className="inp" name="gift" placeholder="Gift or gift intention" disabled={busy} />
        <input className="inp" name="dietary" placeholder="Dietary requirements" disabled={busy} />
        <input className="inp" name="requests" placeholder="Special requests" disabled={busy} />
        <input className="inp" name="notes" placeholder="Anything else we should know" disabled={busy} />
        <button className="btn flex w-full items-center justify-center gap-3" disabled={busy}>
          {busy && (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {busy ? "Sending…" : "Request my invitation"}
        </button>
      </form>

      {ref && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={dismiss}>
          <div role="dialog" aria-modal="true" aria-labelledby="done-title" onClick={(e) => e.stopPropagation()}
            className="rise w-full max-w-md rounded-2xl border-4 border-double border-gold bg-white p-8 text-center">
            <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800" aria-hidden>✓</p>
            <h3 id="done-title" className="mt-4 font-serif text-3xl">Registration received</h3>
            <p className="mt-3">Your request is waiting for the couple’s approval. Once approved, your invitation will be sent to your email.</p>
            <p className="mt-5 text-sm">Your reference</p>
            <p className="font-mono text-2xl tracking-wider">{ref}</p>
            <p className="mt-1 text-sm">Keep it to check your status later.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button className="btn2" onClick={copy}>{copied ? "Copied" : "Copy reference"}</button>
              <button ref={closeBtn} className="btn" onClick={dismiss}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}