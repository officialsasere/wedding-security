"use client";
import { useToast } from "@/components/Toast";
import { useState } from "react";

export default function Login() {
  const toast = useToast();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  

  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const j = await r.json();
      if (r.ok) {
        toast("success", "Signed in. Opening your dashboard…");
        // keep the loading state on while the next page opens
        location.href = j.role === "admin" ? "/admin" : "/security";
        return;
      }
        // setErr(j.error || "Could not sign in. Try again.");
  toast("error", j.error || "Could not sign in. Try again.");
    } catch {
      toast("error", "No connection. Check your internet and try again.");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h1 className="font-serif text-3xl">Staff sign in</h1>
      <form onSubmit={go} className="mt-6 space-y-4" aria-busy={loading}>
        <input className="inp" name="email" type="email" placeholder="Email" required disabled={loading} />
        <input className="inp" name="password" type="password" placeholder="Password" required disabled={loading} />
        {err && <p role="alert" className="text-red-700">{err}</p>}
        <button className="btn flex w-full items-center justify-center gap-3" disabled={loading}>
          {loading && (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {loading && <p role="status" className="text-center text-sm">Please wait, this can take a few seconds.</p>}
      </form>
    </main>
  );
}