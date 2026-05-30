import { signIn } from "@/lib/actions";
import { familyQuickAccess } from "@/lib/family-actions";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <div className="w-full max-w-sm rounded-app border border-line bg-white p-5">
        <p className="text-xs font-black uppercase text-clay">Private access, light interrogation</p>
        <h1 className="mt-1 text-3xl font-black">Eric Family Tracker</h1>
        {params?.error ? <p className="mt-3 rounded-app bg-red-50 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        {params?.message ? <p className="mt-3 rounded-app bg-green-50 p-3 text-sm font-bold text-green-800">{params.message}</p> : null}

        <form action={familyQuickAccess}>
          <label className="mt-5 grid gap-1 text-sm font-bold text-muted">
            Email or phone
            <input className="rounded-app border border-line px-3 py-2 text-ink" name="identifier" type="text" autoComplete="email" required />
          </label>
          <button className="focus-ring mt-5 w-full rounded-app bg-ink px-4 py-3 font-black text-white">Enter the leaderboard</button>
          <p className="mt-3 text-sm font-semibold text-muted">
            Approved family only. No password, no email scavenger hunt. Society advances.
          </p>
        </form>

        <details className="mt-4 rounded-app border border-line p-3">
          <summary className="cursor-pointer text-sm font-black text-ink">Admin password sign-in</summary>
          <form action={signIn} className="mt-3">
            <label className="grid gap-1 text-sm font-bold text-muted">
              Email
              <input className="rounded-app border border-line px-3 py-2 text-ink" name="email" type="email" autoComplete="email" required />
            </label>
            <label className="mt-3 grid gap-1 text-sm font-bold text-muted">
              Password
              <input className="rounded-app border border-line px-3 py-2 text-ink" name="password" type="password" required />
            </label>
            <button className="focus-ring mt-4 w-full rounded-app bg-clay px-4 py-3 font-black text-white">Sign in as admin</button>
            <p className="mt-3 text-center text-sm font-semibold text-muted">
              Admin password escaped custody?{" "}
              <Link className="font-black text-ink underline-offset-4 hover:underline" href="/forgot-password">
                Recover access
              </Link>
            </p>
          </form>
        </details>

        <p className="mt-4 text-center text-sm font-semibold text-muted">
          New here? <Link className="font-black text-ink underline-offset-4 hover:underline" href="/signup">Join the roster</Link>
        </p>
      </div>
    </main>
  );
}
