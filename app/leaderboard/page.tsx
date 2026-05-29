import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { requireApprovedUser } from "@/lib/auth";
import { getAppSettings, getLeaderboard } from "@/lib/data";
import { periods } from "@/lib/periods";
import type { ScorePeriod } from "@/lib/types";

export default async function LeaderboardPage({ searchParams }: { searchParams?: Promise<{ period?: ScorePeriod }> }) {
  await requireApprovedUser();
  const params = await searchParams;
  const period = periods.some((item) => item.value === params?.period) ? params!.period! : "all_time";
  const [rows, settings] = await Promise.all([
    getLeaderboard(period),
    getAppSettings().catch((): Record<string, unknown> => ({}))
  ]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Evidence-based favoritism</p>
          <h2 className="text-3xl font-black">Leaderboard</h2>
        </section>
        <nav className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/leaderboard?period=${item.value}`}
              className={`rounded-app border px-3 py-2 text-sm font-black ${
                item.value === period ? "border-ink bg-ink text-white" : "border-line bg-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LeaderboardTable rows={rows} />
        {settings.inheritance_simulator_enabled !== false ? <InheritanceSimulator rows={rows} /> : null}
      </div>
    </AppShell>
  );
}
