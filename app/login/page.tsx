import { signIn } from "@/lib/actions";
import { familyQuickAccess } from "@/lib/family-actions";
import { BrandMark } from "@/components/BrandMark";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink p-4 text-ivory">
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-mint/15 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="relative w-full max-w-md rounded-app border border-white/10 bg-white/[0.08] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <BrandMark />
        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-gold">Private access, light interrogation</p>
        <h1 className="mt-2 font-serif text-5xl font-black tracking-tight">Enter the ledger</h1>
        {params?.error ? <p className="mt-4 rounded-app border border-red-400/35 bg-red-500/15 p-3 text-sm font-bold text-red-100">{params.error}</p> : null}
        {params?.message ? <p className="mt-4 rounded-app border border-mint/35 bg-mint/15 p-3 text-sm font-bold text-mint">{params.message}</p> : null}

        <form action={familyQuickAccess}>
          <label className="mt-6 grid gap-2 text-sm font-bold text-champagne/75">
            Email or phone
            <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none transition placeholder:text-champagne/30 focus:border-gold" name="identifier" type="text" autoComplete="email" required />
          </label>
          <button className="focus-ring mt-5 w-full rounded-app border border-gold bg-gold px-4 py-3 font-black text-ink shadow-brand hover:bg-champagne">Enter the leaderboard</button>
          <p className="mt-3 text-sm font-semibold text-champagne/65">
            Approved family only. No password, no email scavenger hunt. Society advances.
          </p>
        </form>

        <details className="mt-4 rounded-app border border-white/10 bg-white/[0.04] p-3">
          <summary className="cursor-pointer text-sm font-black text-ivory">Admin password sign-in</summary>
          <form action={signIn} className="mt-3">
            <label className="grid gap-2 text-sm font-bold text-champagne/75">
              Email
              <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="email" type="email" autoComplete="email" required />
            </label>
            <label className="mt-3 grid gap-2 text-sm font-bold text-champagne/75">
              Password
              <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-3 text-ivory outline-none focus:border-gold" name="password" type="password" required />
            </label>
            <button className="focus-ring mt-4 w-full rounded-app bg-white/[0.08] px-4 py-3 font-black text-gold shadow-sm hover:bg-white/[0.12]">Sign in as admin</button>
            <p className="mt-3 text-center text-sm font-semibold text-champagne/60">
              Admin password escaped custody?{" "}
              <Link className="font-black text-gold underline-offset-4 hover:underline" href="/forgot-password">
                Recover access
              </Link>
            </p>
          </form>
        </details>

        <p className="mt-5 text-center text-sm font-semibold text-champagne/65">
          New here? <Link className="font-black text-gold underline-offset-4 hover:underline" href="/signup">Join the roster</Link>
        </p>
      </div>
    </main>
  );
}
