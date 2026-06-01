import Link from "next/link";
import { signUp } from "@/lib/actions";
import { BrandMark } from "@/components/BrandMark";
import { relationshipOptions } from "@/lib/relationships";

export default async function SignupPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-4 text-ivory">
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue/[0.18] blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <form action={signUp} className="relative w-full max-w-2xl rounded-app border border-white/10 bg-white/[0.08] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <BrandMark tone="light" />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-gold">Join the roster</p>
        <h1 className="mt-2 font-serif text-5xl font-black tracking-tight">State your case</h1>
        <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-champagne/70">
          Contact info, relationship, and zero passwords. Civilization advances one tiny form at a time.
        </p>
        {params?.error ? <p className="mt-4 rounded-app border border-red-400/35 bg-red-500/15 p-3 text-sm font-bold text-red-100">{params.error}</p> : null}
        <p className="mt-5 rounded-app border border-gold/25 bg-gold/10 p-3 text-xs font-bold leading-5 text-champagne/75">
          Photo comes after Eric approves you. First we get you into the lobby; then we worry about your leaderboard mugshot.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Name
            <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="name" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Relationship to Eric
            <select className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="relationship" defaultValue="" required>
              <option value="" disabled>
                Choose your role in the audit
              </option>
              {relationshipOptions.map((relationship) => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Phone
            <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="phone" inputMode="tel" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Email
            <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Birthday
            <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="birthday" type="date" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-champagne/75">
            Age bracket
            <select className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="age_bracket" defaultValue="unknown">
              <option value="unknown">Prefer mystery</option>
              <option value="kid">Kid</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </label>
        </div>
        <button className="focus-ring mt-6 w-full rounded-app border border-gold bg-gold px-4 py-3 font-black text-ink shadow-brand hover:bg-champagne">Request entry</button>
        <p className="mt-5 text-center text-sm font-semibold text-champagne/65">
          Already on the books? <Link className="font-black text-gold underline-offset-4 hover:underline" href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
