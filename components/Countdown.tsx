"use client"; import { useEffect, useState } from "react";
export default function Countdown({ date }: { date: string }) {
  const [t, setT] = useState<number | null>(null);
  useEffect(() => { const f = () => setT(Date.parse(date) - Date.now()); f(); const i = setInterval(f, 1000); return () => clearInterval(i); }, [date]);
  if (t === null || isNaN(t)) return null; if (t <= 0) return <p className="font-serif text-2xl text-white">Today is the day</p>;
  const u: [number, string][] = [[Math.floor(t / 864e5), "days"], [Math.floor(t / 36e5) % 24, "hours"], [Math.floor(t / 6e4) % 60, "minutes"], [Math.floor(t / 1e3) % 60, "seconds"]];
  return <div className="flex gap-5 text-white" role="timer" aria-label="Countdown to the wedding">{u.map(([v, l]) => <div key={l} className="text-center"><p className="font-serif text-4xl tabular-nums">{String(v).padStart(2, "0")}</p><p className="text-xs text-white/70">{l}</p></div>)}</div>;
}
