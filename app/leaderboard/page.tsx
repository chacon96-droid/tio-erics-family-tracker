import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardRaceGraph } from "@/components/LeaderboardRaceGraph";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getAppSettings, getLeaderboard } from "@/lib/data";
import { periods } from "@/lib/periods";
import type { ScorePeriod } from "@/lib/types";

export default async function LeaderboardPage({ searchParams }: { searchParams?: Promise<{ period?: ScorePeriod; removed?: string; error?: string }> }) {
  await requireApprovedUser();
  const params = await searchParams;
  const period = periods.some((item) => item.value === params?.period) ? params!.period! : "all_time";
  const [familyRows, friendRows, settings, profile] = await Promise.all([
    getLeaderboard(period, "family"),
    getLeaderboard(period, "friends"),
    getAppSettings().catch((): Record<string, unknown> => ({})),
    getProfile()
  ]);
  const isAdmin = profile?.role === "admin";

  return (
    <AppShell>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Evidence-based favoritism</p>
          <h2 className="text-3xl font-black">Leaderboard</h2>
          {params?.removed ? (
            <div className="mt-4 rounded-app border border-green-200 bg-green-50 p-3 text-sm font-black text-green-800">
              Removed {params.removed}. The leaderboard has agreed to move on, after making it weird for a second.
            </div>
          ) : null}
          {params?.error ? (
            <div className="mt-4 rounded-app border border-red-200 bg-red-50 p-3 text-sm font-black text-red-800">
              Could not remove that profile: {params.error}
            </div>
          ) : null}
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
        <section>
          <div className="mb-3">
            <p className="text-xs font-black uppercase text-clay">Bloodline division</p>
            <h3 className="text-xl font-black">Family leaderboard</h3>
          </div>
          <LeaderboardRaceGraph rows={familyRows} title="Family photo race" />
          <LeaderboardTable rows={familyRows} canRemovePeople={isAdmin} />
          {settings.inheritance_simulator_enabled !== false ? <InheritanceSimulator rows={familyRows} /> : null}
        </section>
        <section>
          <div className="mb-3">
            <p className="text-xs font-black uppercase text-clay">Chosen chaos division</p>
            <h3 className="text-xl font-black">Family friends leaderboard</h3>
          </div>
          <LeaderboardRaceGraph rows={friendRows} title="Family friends photo race" />
          <LeaderboardTable rows={friendRows} canRemovePeople={isAdmin} />
          {settings.inheritance_simulator_enabled !== false ? <InheritanceSimulator rows={friendRows} /> : null}
        </section>
      </div>
    </AppShell>
  );
}
