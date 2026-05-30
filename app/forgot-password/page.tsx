import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams?: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <form action={requestPasswordReset} className="w-full max-w-sm rounded-app border border-line bg-white p-5">
        <p className="text-xs font-black uppercase text-clay">Password recovery</p>
        <h1 className="mt-1 text-3xl font-black">Re-enter the arena</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          Enter your email and I'll send a reset link. Very official. Slightly less fun than forgetting nothing.
        </p>
        {params?.error ? <p className="mt-3 rounded-app bg-red-50 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        {params?.sent ? (
          <p className="mt-3 rounded-app bg-green-50 p-3 text-sm font-bold text-green-800">
            Reset link sent to {params.sent}. Check your email on this phone and follow the link.
          </p>
        ) : null}
        <label className="mt-5 grid gap-1 text-sm font-bold text-muted">
          Email
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="email" type="email" autoComplete="email" required />
        </label>
        <button className="focus-ring mt-5 w-full rounded-app bg-ink px-4 py-3 font-black text-white">Send reset link</button>
        <p className="mt-4 text-center text-sm font-semibold text-muted">
          Remembered it heroically?{" "}
          <Link className="font-black text-ink underline-offset-4 hover:underline" href="/login">
            Back to login
          </Link>
        </p>
      </form>
    </main>
  );
}
