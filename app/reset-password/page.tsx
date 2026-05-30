import { updatePassword } from "@/lib/actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <form action={updatePassword} className="w-full max-w-sm rounded-app border border-line bg-white p-5">
        <p className="text-xs font-black uppercase text-clay">New password</p>
        <h1 className="mt-1 text-3xl font-black">Choose your new key</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          Make it at least 8 characters. Preferably not "password," because even the leaderboard has standards.
        </p>
        {params?.error ? <p className="mt-3 rounded-app bg-red-50 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        <label className="mt-5 grid gap-1 text-sm font-bold text-muted">
          New password
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="password" type="password" minLength={8} required />
        </label>
        <label className="mt-3 grid gap-1 text-sm font-bold text-muted">
          Confirm password
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="confirm_password" type="password" minLength={8} required />
        </label>
        <button className="focus-ring mt-5 w-full rounded-app bg-ink px-4 py-3 font-black text-white">Update password</button>
      </form>
    </main>
  );
}
