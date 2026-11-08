import Logo from "@/components/Logo"; import Countdown from "@/components/Countdown"; import RegisterForm from "@/components/RegisterForm"; import { settings } from "@/lib/sheets";
export const revalidate = 60;
const D = { coupleNames: "KaroGotHisGift26", weddingDate: "", weddingTime: "", venue: "", venueAddress: "" };
export default async function Home() {
  let s: Record<string, string> = {}; try { s = await settings(); } catch {}
  const w = { ...D, ...Object.fromEntries(Object.entries(s).filter(([, v]) => v)) };
  const pretty = w.weddingDate && !isNaN(Date.parse(w.weddingDate)) ? new Date(w.weddingDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date to be announced";
  const steps = [["Register", "Tell us who is coming and how many."], ["Wait for approval", "The couple reviews every request."], ["Receive your invitation", "A personal card with your QR code arrives by email."], ["Show it at the door", "Security scans your code and welcomes you in."]];
  return (<>
    <section className="relative overflow-hidden bg-[#1d0e1b] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5"><Logo light /><a href="#register" className="rounded-full border border-white/40 px-4 py-2 text-sm">Register</a></header>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:pb-24">
        <div className="rise"><p className="text-white/70">Together with their families</p>
          <h1 className="mt-4 break-words font-serif text-4xl leading-tight sm:text-6xl">{w.coupleNames}</h1>
          <p className="mt-5 max-w-md text-lg text-white/85">We are getting married, and we would love you beside us. Register to receive your personal invitation.</p>
          <p className="mt-6 font-serif text-2xl text-[#e7c98f]">{pretty}{w.weddingTime && ` · ${w.weddingTime}`}</p>
          {w.venue && <p className="text-white/80">{w.venue}{w.venueAddress && `, ${w.venueAddress}`}</p>}
          <div className="mt-7">{w.weddingDate && <Countdown date={w.weddingDate} />}</div>
          <a href="#register" className="mt-8 inline-block rounded-full bg-[#B08D57] px-8 py-4 font-medium text-[#1d0e1b]">Register to attend</a></div>
        <div className="mx-auto w-full max-w-sm" aria-hidden>
          <div className="arch relative aspect-[3/4] overflow-hidden border-[6px] border-[#B08D57]/70">
            <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full"><g fill="#fff" opacity=".85"><circle cx="70" cy="90" r="1.6" /><circle cx="210" cy="60" r="1.2" /><circle cx="150" cy="40" r="1.8" /><circle cx="240" cy="120" r="1.2" /><circle cx="95" cy="150" r="1" /></g>
              <circle cx="150" cy="300" r="58" fill="#f8e3b0" opacity=".95" />
              <path d="M0 330 Q75 290 150 325 T300 315 V400 H0Z" fill="#4a2142" /><path d="M0 365 Q90 330 170 360 T300 350 V400 H0Z" fill="#2a1427" />
              <g stroke="#B08D57" strokeWidth="2" fill="none"><circle cx="125" cy="205" r="26" /><circle cx="175" cy="205" r="26" /></g>
              <g stroke="#e7c98f" strokeWidth="1.5" fill="none" opacity=".8"><path d="M20 400 C20 330 40 300 36 250 M36 290 q-18-8-22-26 M36 270 q16-6 20-24" /><path d="M280 400 C280 330 260 300 264 250 M264 290 q18-8 22-26 M264 270 q-16-6-20-24" /></g></svg></div></div></div></section>
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="font-serif text-3xl">How your invitation works</h2>
      <ol className="mt-8 grid gap-6 md:grid-cols-4">{steps.map(([t, d], i) => <li key={t} className="border-t-2 border-gold pt-4"><p className="text-sm text-gold">Step {i + 1}</p><p className="mt-1 font-serif text-xl">{t}</p><p className="mt-2">{d}</p></li>)}</ol></section>
    <section className="bg-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
      <div><h3 className="font-serif text-2xl">When</h3><p className="mt-2">{pretty}{w.weddingTime && <><br />{w.weddingTime}</>}</p></div>
      <div><h3 className="font-serif text-2xl">Where</h3><p className="mt-2">{w.venue || "Venue to be announced"}{w.venueAddress && <><br />{w.venueAddress}</>}</p></div>
      <div><h3 className="font-serif text-2xl">At the entrance</h3><p className="mt-2">Entry is by approved invitation only. Bring your QR code or access code on your phone.</p></div></div></section>
    <section id="register" className="mx-auto max-w-xl px-5 py-16"><h2 className="font-serif text-3xl">Register to attend</h2><p className="mb-6 mt-2">Your invitation is issued only after the couple approves your registration.</p><RegisterForm />
      <p className="mt-6 text-sm">Already registered? <a className="underline" href="/status">Check your status</a></p></section>
    <footer className="bg-[#1d0e1b] px-5 py-8 text-center text-white/80"><Logo light /><p className="mt-2 text-sm">Staff? <a className="underline" href="/login">Sign in</a></p></footer></>);
}
