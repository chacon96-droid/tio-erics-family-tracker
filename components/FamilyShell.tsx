import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { familySignOut } from "@/lib/family-actions";
import type { Person } from "@/lib/types";

export function FamilyShell({ person, children }: { person: Person; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-gold/30 bg-ivory/95 shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-clay">Approved roster access, suspiciously easy</p>
            <p className="mt-1 text-sm font-bold text-muted">Signed in as {person.name}. The judgment is personalized now.</p>
          </div>
          <form action={familySignOut}>
            <button className="focus-ring rounded-app border border-ink bg-ink px-3 py-2 text-sm font-black text-ivory shadow-brand">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-4">
          <Link href="/family/me" className="rounded-app border border-line bg-white/80 px-3 py-2 text-sm font-black shadow-sm hover:border-gold">
            My profile
          </Link>
          <Link href="/family/leaderboard" className="rounded-app border border-line bg-white/80 px-3 py-2 text-sm font-black shadow-sm hover:border-gold">
            Leaderboard
          </Link>
          <Link href="/signup" className="rounded-app border border-line bg-white/80 px-3 py-2 text-sm font-black shadow-sm hover:border-gold">
            Roster
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
