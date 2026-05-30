import Link from "next/link";
import { FamilyShell } from "@/components/FamilyShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getFamilyLeaderboard, requireFamilyAccessPerson } from "@/lib/family-access";
import { periods } from "@/lib/periods";
import type { ScorePeriod } from "@/lib/types";

export default async function FamilyLeaderboardPage({ searchParams }: { searchParams?: Promise<{ period?: ScorePeriod }> }) {
  const [person, params] = await Promise.all([requireFamilyAccessPerson(), searchParams]);
  const period = periods.some((item) => item.value === params?.period) ? params!.period! : "year";
  const rows = await getFamilyLeaderboard(period);

  return (
    <FamilyShell person={person}>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Evidence-based favoritism</p>
          <h2 className="text-3xl font-black">Leaderboard</h2>
          <p className="mt-2 max-w-2xl font-semibold text-muted">
            If you are losing, remember: denial is free, but calling Eric scores better.
          </p>
        </section>
        <nav className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/family/leaderboard?period=${item.value}`}
              className={`rounded-app border px-3 py-2 text-sm font-black ${
                item.value === period ? "border-ink bg-ink text-white" : "border-line bg-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LeaderboardTable rows={rows} />
        <InheritanceSimulator rows={rows} />
      </div>
    </FamilyShell>
  );
}
