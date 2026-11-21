"use client"; 

import { useToast } from "@/components/Toast";
import { useEffect, useRef, useState } from "react";

const COL: Record<string, [string, string]> = { valid: ["bg-green-700", "VALID · Admit"], partial: ["bg-amber-600", "PARTIALLY CHECKED IN"], full: ["bg-red-700", "FULLY CHECKED IN · No slots left"], invalid: ["bg-red-800", "INVALID INVITATION"], revoked: ["bg-red-800", "INVITATION REVOKED"], rejected: ["bg-red-800", "REGISTRATION REJECTED"] };

export default function Security() {
  const toast = useToast();
  const [r, setR] = useState<any>(null); const [n, setN] = useState(1); const [msg, setMsg] = useState(""); const [scan, setScan] = useState(false); const [busy, setBusy] = useState(false); const key = useRef(""); const sc = useRef<any>(null); const method = useRef("qr");
  async function verify(body: object) { setMsg(""); setBusy(true); try { const x = await fetch("/api/security/verify", { method: "POST", body: JSON.stringify(body) }); if (!x.ok) throw 0; const j = await x.json(); key.current = crypto.randomUUID(); setR(j); setN(1); } catch { setMsg(navigator.onLine ? "Verification failed. Try again." : "No connection. Verification can’t be completed offline."); } setBusy(false); }
  useEffect(() => {
    if (!scan) return;
    let cancelled = false, done = false; let q: any = null; let started: Promise<unknown> = Promise.resolve();
    // accepts the full invitation URL (any host) or a bare token
    const tokenFrom = (t: string) => { const m = t.trim().match(/\/invitation\/([A-Za-z0-9_-]+)/); return m ? m[1] : /^[A-Za-z0-9_-]{20,}$/.test(t.trim()) ? t.trim() : null; };
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return; // effect re-ran (Strict Mode) or scan closed before the library loaded
      q = new Html5Qrcode("reader"); sc.current = q;
      started = q.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (t: string) => {
        if (done) return;
        const tok = tokenFrom(t);
        if (!tok) { setMsg("That QR code is not a wedding invitation."); return; }
        done = true; method.current = "qr"; setScan(false); verify({ token: tok }); // cleanup stops the camera
      }, () => {}).catch(() => { if (!cancelled) { setMsg("Camera unavailable. Allow camera access (needs HTTPS) or enter the code."); setScan(false); } });
      await started;
      if (cancelled) q.stop().catch(() => {}); // cleanup ran while the camera was still starting
    })();
    return () => { cancelled = true; if (q) started.then(() => q.stop()).catch(() => {}); };
  }, [scan]);
 async function admit() {
  setBusy(true);
  const x = await fetch("/api/security/checkin", { method: "POST", body: JSON.stringify({ invitationId: r.invitationId, count: n, key: key.current, method: method.current }) }).catch(() => null);
  const j = x ? await x.json() : null; setBusy(false);
  if (x?.ok) { toast("success", `Admitted ${j.admitted}. ${j.remaining ?? 0} slot(s) left.`); setR(null); }
  else toast("error", j?.error ?? "No connection. Check-in was not recorded.");
}
  const c = r && COL[r.state];
  return <main className="mx-auto max-w-md space-y-4 p-4"><div className="flex justify-between"><h1 className="font-serif text-2xl">Entrance</h1><button className="underline" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}>Sign out</button></div>
    {scan ? <><div id="reader" className="overflow-hidden rounded-xl" /><button className="btn w-full py-5" onClick={() => setScan(false)}>Cancel</button></> : <button className="btn w-full py-6 text-xl" onClick={() => { setR(null); setScan(true); }}>Scan QR code</button>}
    <form onSubmit={(e) => { e.preventDefault(); method.current = "code"; verify({ code: new FormData(e.currentTarget).get("code") }); }} className="flex gap-2"><input name="code" className="inp text-xl uppercase" placeholder="Access code" required /><button className="btn" disabled={busy}>Check</button></form>
    {msg && <p role="status" className="rounded-lg bg-white p-3 text-lg">{msg}</p>}
    {r && <div className={`${c[0]} rounded-2xl p-5 text-white`}><p className="text-xl font-bold">{c[1]}</p>{r.guest && <><p className="mt-3 font-serif text-3xl">{r.guest}</p><p>{r.relationship}</p><p className="mt-2 text-lg">Approved {r.approved} · In {r.used} · Remaining <b>{r.remaining}</b></p>{r.guestNames && <p className="text-sm">Party: {r.guestNames}</p>}</>}
      {r.remaining > 0 && ["valid", "partial"].includes(r.state) && <div className="mt-4 rounded-xl bg-white p-4 text-ink"><p>How many are arriving now?</p><div className="mt-2 flex items-center gap-4"><button className="btn2 text-2xl" onClick={() => setN(Math.max(1, n - 1))}>−</button><span className="text-4xl font-bold">{n}</span><button className="btn2 text-2xl" onClick={() => setN(n + 1)}>+</button></div><button className="btn mt-4 w-full py-4 text-lg" disabled={busy} onClick={admit}>Admit {n}</button></div>}</div>}</main>;
}
