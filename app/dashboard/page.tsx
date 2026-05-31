import { AppShell } from "@/components/AppShell";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { requireApprovedUser } from "@/lib/auth";
import { getApprovedInteractionCount, getInteractions, getLeaderboard, getPendingInteractions, getPendingPeople, getPeople } from "@/lib/data";
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
  const topScore = [...familyLeaderboard, ...friendLeaderboard].sort((a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0))[0];

  return (
    <AppShell>
      <div className="grid gap-7">
        <section className="relative overflow-hidden rounded-app border border-white/10 bg-white/[0.07] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.34)]">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-mint/15 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Family analytics, emotionally unnecessary</p>
            <h2 className="mt-3 font-serif text-5xl font-black tracking-tight text-ivory md:text-7xl">Command Center</h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-champagne/75">
              A live ranking desk for calls, texts, quality time, and whatever else the family claims should count after realizing they are losing.
            </p>
          </div>
        </section>
        <section className="grid gap-3 md:grid-cols-4">
          <StatCard label="Active people" value={people.filter((person) => person.active).length} detail="Roster, not evidence." />
          <StatCard label="Approved in 2026" value={approvedCount} detail="Documented affection, calendar-year edition." />
          <StatCard label="Pending approvals" value={pendingInteractions.length + pendingPeople.length} detail={qualityTimeNudge("dashboard-pending")} />
          <StatCard
            label="Top score"
            value={topScore?.score?.total_score || 0}
            detail={topScore?.name ? `${topScore.name}. ${dashboardReaction(topScore.id)}` : "The throne is currently available."}
          />
        </section>
        <DashboardAnalytics people={people} interactions={yearInteractions} familyRows={familyLeaderboard} friendRows={friendLeaderboard} />
        <section className="rounded-app border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">2026 so far, allegedly</p>
              <h3 className="font-serif text-3xl font-black text-ivory">Family leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={familyLeaderboard.slice(0, 5)} />
        </section>
        <section className="rounded-app border border-white/10 bg-white/[0.06] p-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Friend division, still legally non-binding</p>
              <h3 className="font-serif text-3xl font-black text-ivory">Family friends leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={friendLeaderboard.slice(0, 5)} />
        </section>
      </div>
    </AppShell>
  );
}
