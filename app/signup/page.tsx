import Link from "next/link";
import { signUp } from "@/lib/actions";
import { relationshipOptions } from "@/lib/relationships";

export default async function SignupPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-paper p-4">
      <form action={signUp} encType="multipart/form-data" className="w-full max-w-xl rounded-app border border-line bg-white p-5">
        <p className="text-xs font-black uppercase text-clay">Join the roster</p>
        <h1 className="mt-1 text-3xl font-black">State your case</h1>
        <p className="mt-2 text-sm font-semibold text-muted">
          Contact info, relationship, and zero passwords. Civilization advances one tiny form at a time.
        </p>
        {params?.error ? <p className="mt-3 rounded-app bg-red-50 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
        <label className="mt-5 grid gap-1 text-sm font-bold text-muted">
          Profile photo
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="avatar_file" type="file" accept="image/*" capture="user" />
          <span className="text-xs font-semibold text-muted">Camera or camera roll. The leaderboard deserves a face for the evidence board.</span>
        </label>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold text-muted">
            Name
            <input className="rounded-app border border-line px-3 py-2 text-ink" name="name" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-muted">
            Relationship to Eric
            <select className="rounded-app border border-line px-3 py-2 text-ink" name="relationship" defaultValue="" required>
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
          <label className="grid gap-1 text-sm font-bold text-muted">
            Phone
            <input className="rounded-app border border-line px-3 py-2 text-ink" name="phone" inputMode="tel" />
          </label>
          <label className="grid gap-1 text-sm font-bold text-muted">
            Email
            <input className="rounded-app border border-line px-3 py-2 text-ink" name="email" type="email" required />
          </label>
          <label className="grid gap-1 text-sm font-bold text-muted">
            Birthday
            <input className="rounded-app border border-line px-3 py-2 text-ink" name="birthday" type="date" />
          </label>
          <label className="grid gap-1 text-sm font-bold text-muted">
            Age bracket
            <select className="rounded-app border border-line px-3 py-2 text-ink" name="age_bracket" defaultValue="unknown">
              <option value="unknown">Prefer mystery</option>
              <option value="kid">Kid</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </label>
        </div>
        <button className="focus-ring mt-5 w-full rounded-app bg-ink px-4 py-3 font-black text-white">Request entry</button>
        <p className="mt-4 text-center text-sm font-semibold text-muted">
          Already on the books? <Link className="font-black text-ink underline-offset-4 hover:underline" href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
