"use client";

import { useToast } from "@/components/Toast";
import { useEffect, useState, useCallback } from "react";

type R = Record<string, string>;

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink/60">{label}</p>
      <p className="break-words">{value}</p>
    </div>
  );
}

export default function Admin() {
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const [d, setD] = useState<any>(null);
  const [q, setQ] = useState("");
  const [sec, setSec] = useState<R[]>([]);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/registrations");
    if (r.ok) setD(await r.json());
    const u = await fetch("/api/admin/users");
    if (u.ok) setSec(await u.json());
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function act(id: string, action: string) {
  let count, note;
  if (action === "approve") {
    const reg = d.registrations.find((x: R) => x.id === id);
    const c = prompt(
      `Approve for how many people in total (guest + companions)?\n${reg.fullName} requested ${reg.totalRequested}.`,
      reg.totalRequested
    );
    if (!c) return;
    count = c;
  }
  if (action === "reject") note = prompt("Reason for rejection?") ?? "";
  if (action === "revoke" && !confirm("Revoke this invitation?")) return;

  const working: Record<string, string> = {
    approve: "Approving and sending invitation…",
    reject: "Rejecting…",
    revoke: "Revoking…",
    resend: "Resending invitation…",
  };
  const done: Record<string, string> = {
    approve: "Registration approved",
    reject: "Registration rejected",
    revoke: "Invitation revoked",
    resend: "Invitation resent",
  };
  const sendsEmail = action === "approve" || action === "resend";

  setBusy(id);
  toast("info", working[action]);
  try {
    const r = await fetch("/api/admin/decision", {
      method: "POST",
      body: JSON.stringify({ id, action, count, note }),
    });
    const j = await r.json();
    if (!r.ok) toast("error", j.error ?? "Action failed");
    else if (!sendsEmail) toast("success", `${done[action]}.`);
    else if (j.emailed) toast("success", `${done[action]}. Invitation emailed to the guest.`);
    else toast("error", `${done[action]}, but the email failed. Try Resend.`);
  } catch {
    toast("error", "No connection. Nothing was changed.");
  }
  setBusy("");
  load();
}

  async function addSec(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    toast("info", "Creating account…");
    const r = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(f))),
    });
    if (r.ok) {
      toast("success", "Security account created.");
      f.reset();
    } else {
      toast("error", "Could not create the account. Check the email and use 8+ characters.");
    }
    load();
  }

  async function toggle(u: R) {
    const r = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ toggle: u.id }),
    });
    toast(
      r.ok ? "success" : "error",
      r.ok
        ? `${u.fullName} is now ${u.status === "Active" ? "deactivated" : "active"}.`
        : "Could not update the account."
    );
    load();
  }

  if (!d) return <main className="p-6">Loading…</main>;

  const s = d.stats;
  const rows = d.registrations.filter((r: R) =>
    [r.fullName, r.email, r.phone].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-5xl p-5">
      <h1 className="font-serif text-3xl">Guest management</h1>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Registered", s.total],
          ["Pending", s.pending],
          ["Approved", s.approved],
          ["Rejected", s.rejected],
          ["Invitations", s.issued],
          ["Revoked", s.revoked],
          ["Expected", s.expected],
          ["Checked in", s.inside],
          ["Remaining", s.remaining],
          ["Attendance", s.pct + "%"],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-xl bg-white p-4">
            <p className="text-sm">{k}</p>
            <p className="font-serif text-3xl">{v}</p>
          </div>
        ))}
      </div>

      <input
        className="inp mt-6"
        placeholder="Search name, email or phone"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-4 space-y-4">
        {rows.map((r: R) => {
          const extra = Number(r.additionalGuests) || 0;
          const total = Number(r.totalRequested) || extra + 1;
          const badge =
            r.status === "Approved"
              ? "bg-green-100 text-green-800"
              : r.status === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800";

          return (
            <div key={r.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 p-4">
                <div>
                  <p className="font-serif text-xl">{r.fullName}</p>
                  <p className="text-sm text-ink/70">
                    {r.relationship} · Ref {r.id}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge}`}>{r.status}</span>
              </div>

              <div className="grid gap-4 p-4 md:grid-cols-[200px_1fr]">
                <div className="rounded-xl bg-mist p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-ink/60">Party size</p>
                  <p className="font-serif text-5xl">{total}</p>
                  <p className="text-sm">
                    {extra > 0
                      ? `Guest + ${extra} companion${extra > 1 ? "s" : ""}`
                      : "Guest only"}
                  </p>
                  {r.status === "Approved" && (
                    <p className="mt-2 rounded-lg bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
                      Approved for {r.approvedCount}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail label="Email" value={r.email} />
                  <Detail label="Phone" value={r.phone} />
                  <Detail label="Companions' names" value={r.guestNames} />
                  <Detail label="Gift" value={r.gift} />
                  <Detail label="Dietary needs" value={r.dietary} />
                  <Detail label="Special requests" value={r.requests} />
                  <Detail label="Notes" value={r.notes} />
                  <Detail
                    label="Registered"
                    value={r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""}
                  />
                  {r.status === "Rejected" && <Detail label="Reason" value={r.adminNote} />}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-ink/10 bg-mist/60 p-3">
                {r.status === "Pending Approval" && (
                  <>
                    <button className="btn" disabled={busy === r.id} onClick={() => act(r.id, "approve")}>
                      {busy === r.id ? "Working…" : `Approve for ${total}`}
                    </button>
                    <button className="btn2" disabled={busy === r.id} onClick={() => act(r.id, "reject")}>
                      Reject
                    </button>
                  </>
                )}
                {r.status === "Approved" && (
                  <>
                    <button className="btn2" disabled={busy === r.id} onClick={() => act(r.id, "resend")}>
                      {busy === r.id ? "Working…" : "Resend invitation"}
                    </button>
                    <button className="btn2" disabled={busy === r.id} onClick={() => act(r.id, "revoke")}>
                      Revoke
                    </button>
                  </>
                )}
                {r.status === "Rejected" && (
                  <p className="py-2 text-sm text-ink/70">This registration was rejected.</p>
                )}
              </div>
            </div>
          );
        })}
        {!rows.length && <p>No registrations match.</p>}
      </div>

      <h2 className="mt-10 font-serif text-2xl">Security team</h2>
      <form onSubmit={addSec} className="mt-3 grid gap-2 md:grid-cols-4">
        <input className="inp" name="fullName" placeholder="Name" required />
        <input className="inp" name="email" type="email" placeholder="Email" required />
        <input className="inp" name="password" placeholder="Password (8+)" required />
        <button className="btn">Add officer</button>
      </form>
      <ul className="mt-3 space-y-2">
        {sec.map((u) => (
          <li key={u.id} className="flex justify-between rounded-lg bg-white p-3">
            <span>
              {u.fullName} · {u.status} · admitted{" "}
              {d.byOfficer.find((o: R) => o.name === u.fullName)?.admitted ?? 0}
            </span>
            <button className="btn2" onClick={() => toggle(u)}>
              {u.status === "Active" ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}