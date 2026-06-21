import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardRaceGraph } from "@/components/LeaderboardRaceGraph";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getAppSettings, getLeaderboard } from "@/lib/data";
import { periods } from "@/lib/periods";
import type { ScorePeriod } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="grid min-w-0 gap-5 sm:gap-7">
        <section className="relative min-w-0 overflow-hidden rounded-app border border-white/10 bg-white/[0.07] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.34)] sm:p-6">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue/20 blur-3xl" />
          <div className="absolute -bottom-28 left-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Evidence-based favoritism</p>
            <h2 className="mt-3 font-serif text-4xl font-black tracking-tight text-ivory sm:text-5xl md:text-7xl">Leaderboard</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-champagne/75">
              The official market index of who remembered Eric exists. Updated with Apple metadata, manual claims, and a dangerous amount of confidence.
            </p>
          </div>
          {params?.removed ? (
            <div className="relative mt-5 rounded-app border border-mint/35 bg-mint/15 p-3 text-sm font-black text-mint">
              Removed {params.removed}. The leaderboard has agreed to move on, after making it weird for a second.
            </div>
          ) : null}
          {params?.error ? (
            <div className="relative mt-5 rounded-app border border-red-400/35 bg-red-500/15 p-3 text-sm font-black text-red-100">
              Could not remove that profile: {params.error}
            </div>
          ) : null}
        </section>
        <nav className="flex min-w-0 flex-wrap gap-2 rounded-app border border-white/10 bg-white/[0.05] p-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/leaderboard?period=${item.value}`}
              className={`rounded-app border px-3 py-2 text-sm font-black transition ${
                item.value === period ? "border-gold/70 bg-gold text-ink" : "border-white/10 bg-white/[0.04] text-champagne/75 hover:border-white/25 hover:text-ivory"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <section className="grid min-w-0 gap-4 rounded-app border border-white/10 bg-white/[0.06] p-3 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Bloodline division</p>
            <h3 className="font-serif text-2xl font-black text-ivory sm:text-3xl">Family leaderboard</h3>
          </div>
          <LeaderboardRaceGraph rows={familyRows} title="Tio Eric Family Totem Pole" />
          <LeaderboardTable rows={familyRows} canRemovePeople={isAdmin} />
          {settings.inheritance_simulator_enabled !== false ? <InheritanceSimulator rows={familyRows} /> : null}
        </section>
        <section className="grid min-w-0 gap-4 rounded-app border border-white/10 bg-white/[0.06] p-3 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Chosen chaos division</p>
            <h3 className="font-serif text-2xl font-black text-ivory sm:text-3xl">Family friends leaderboard</h3>
          </div>
          <LeaderboardRaceGraph rows={friendRows} title="Eric's Friend Aura Index" />
          <LeaderboardTable rows={friendRows} canRemovePeople={isAdmin} />
          {settings.inheritance_simulator_enabled !== false ? <InheritanceSimulator rows={friendRows} /> : null}
        </section>
      </div>
    </AppShell>
  );
}
