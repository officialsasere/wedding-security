import "./globals.css";
import { ToastProvider } from "@/components/Toast";
export const metadata = { title: "Wedding", manifest: "/manifest.json" };
export default function L({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider></body></html>;
}