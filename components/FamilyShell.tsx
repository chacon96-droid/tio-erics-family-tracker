import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { familySignOut } from "@/lib/family-actions";
import type { Person } from "@/lib/types";

export function FamilyShell({ person, children }: { person: Person; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ivory">
      <header className="border-b border-white/10 bg-ink/[0.90] shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandMark tone="light" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-clay">Approved roster access, suspiciously easy</p>
            <p className="mt-1 text-sm font-bold text-muted">Signed in as {person.name}. The judgment is personalized now.</p>
          </div>
          <form action={familySignOut}>
            <button className="focus-ring rounded-app border border-gold/60 bg-gold px-3 py-2 text-sm font-black text-ink shadow-brand hover:bg-champagne">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-4">
          <Link href="/family/me" className="rounded-app border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-black text-ivory shadow-sm hover:border-mint/70 hover:bg-white/[0.14]">
            My profile
          </Link>
          <Link href="/family/leaderboard" className="rounded-app border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-black text-ivory shadow-sm hover:border-mint/70 hover:bg-white/[0.14]">
            Leaderboard
          </Link>
          <Link href="/signup" className="rounded-app border border-white/10 bg-white/[0.08] px-3 py-2 text-sm font-black text-ivory shadow-sm hover:border-mint/70 hover:bg-white/[0.14]">
            Roster
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
