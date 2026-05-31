import { AppShell } from "@/components/AppShell";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { requireApprovedUser } from "@/lib/auth";
import { getApprovedInteractionCount, getInteractions, getLeaderboard, getPendingInteractions, getPendingPeople, getPeople } from "@/lib/data";
import { favorScoreForRow, maxTotalScore } from "@/lib/display-score";
import { dashboardReaction, qualityTimeNudge } from "@/lib/family-lore";

export default async function DashboardPage() {
  await requireApprovedUser();
  const [people, approvedCount, pendingInteractions, pendingPeople, familyLeaderboard, friendLeaderboard, yearInteractions] = await Promise.all([
    getPeople(),
    getApprovedInteractionCount("year"),
    getPendingInteractions().catch(() => []),
    getPendingPeople().catch(() => []),
    getLeaderboard("year", "family").catch(() => []),
    getLeaderboard("year", "friends").catch(() => []),
    getInteractions("year").catch(() => [])
  ]);
  const combinedLeaderboard = [...familyLeaderboard, ...friendLeaderboard].sort((a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0));
  const topScore = combinedLeaderboard[0];
  const topScoreMax = maxTotalScore(combinedLeaderboard);

  return (
    <AppShell>
      <div className="grid min-w-0 gap-5 sm:gap-7">
        <section className="relative min-w-0 overflow-hidden rounded-app border border-white/10 bg-white/[0.07] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.34)] sm:p-6">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Family analytics, emotionally unnecessary</p>
            <h2 className="mt-3 font-serif text-4xl font-black tracking-tight text-ivory sm:text-5xl md:text-7xl">Command Center</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-champagne/75">
              A live ranking desk for calls, texts, quality time, and whatever else the family claims should count after realizing they are losing.
            </p>
          </div>
        </section>
        <section className="grid gap-3 md:grid-cols-4">
          <StatCard label="Active people" value={people.filter((person) => person.active).length} detail="Roster, not evidence." />
          <StatCard label="2026 interactions tracked" value={approvedCount} detail="Documented affection, calendar-year edition." />
          <StatCard label="Pending approvals" value={pendingInteractions.length + pendingPeople.length} detail={qualityTimeNudge("dashboard-pending")} />
          <StatCard
            label="Top Aura Index"
            value={topScore ? favorScoreForRow(topScore, topScoreMax) : 0}
            detail={topScore?.name ? `${topScore.name}. ${dashboardReaction(topScore.id)}` : "The throne is currently available."}
          />
        </section>
        <DashboardAnalytics people={people} interactions={yearInteractions} familyRows={familyLeaderboard} friendRows={friendLeaderboard} />
        <section className="min-w-0 rounded-app border border-white/10 bg-white/[0.06] p-3 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">2026 so far, allegedly</p>
              <h3 className="font-serif text-2xl font-black text-ivory sm:text-3xl">Family leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={familyLeaderboard.slice(0, 5)} />
        </section>
        <section className="min-w-0 rounded-app border border-white/10 bg-white/[0.06] p-3 sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Friend division, still legally non-binding</p>
              <h3 className="font-serif text-2xl font-black text-ivory sm:text-3xl">Family friends leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={friendLeaderboard.slice(0, 5)} />
        </section>
      </div>
    </AppShell>
  );
}
