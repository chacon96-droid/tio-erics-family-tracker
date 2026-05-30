import Link from "next/link";
import { familySignOut } from "@/lib/family-actions";
import type { Person } from "@/lib/types";

export function FamilyShell({ person, children }: { person: Person; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/95">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-clay">Approved roster access, suspiciously easy</p>
            <h1 className="text-2xl font-black text-ink">Eric Family Tracker</h1>
            <p className="mt-1 text-sm font-bold text-muted">Signed in as {person.name}. The judgment is personalized now.</p>
          </div>
          <form action={familySignOut}>
            <button className="focus-ring rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-4">
          <Link href="/family/me" className="rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
            My profile
          </Link>
          <Link href="/family/leaderboard" className="rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
            Leaderboard
          </Link>
          <Link href="/signup" className="rounded-app border border-line bg-white px-3 py-2 text-sm font-bold">
            Roster
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
