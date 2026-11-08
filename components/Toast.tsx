"use client";
import { createContext, useCallback, useContext, useState } from "react";

type Kind = "success" | "error" | "info";
type T = { id: number; kind: Kind; text: string };

const Ctx = createContext<(kind: Kind, text: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

const COLOR: Record<Kind, string> = { success: "bg-green-700", error: "bg-red-700", info: "bg-ink" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const close = (id: number) => setItems((l) => l.filter((x) => x.id !== id));
  const push = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l.slice(-3), { id, kind, text }]);
    setTimeout(() => close(id), 5000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4">
        {items.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
            className={`rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg ${COLOR[t.kind]}`}>
            <span className="flex-1">{t.text}</span>
            <button onClick={() => close(t.id)} aria-label="Dismiss" className="text-white/80">✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}