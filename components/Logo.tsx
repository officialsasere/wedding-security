export default function Logo({ light = false }: { light?: boolean }) {
  return <a href="/" className={`inline-flex items-center gap-2 font-serif text-xl tracking-wide ${light ? "text-white" : "text-ink"}`} aria-label="KaroGotHisGift26 home">
    <svg width="34" height="22" viewBox="0 0 34 22" fill="none" stroke="#B08D57" strokeWidth="1.6" aria-hidden><circle cx="12" cy="11" r="9" /><circle cx="22" cy="11" r="9" /></svg>KaroGotHisGift26</a>;
}
