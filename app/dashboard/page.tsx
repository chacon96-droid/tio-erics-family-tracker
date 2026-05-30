import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { requireApprovedUser } from "@/lib/auth";
import { getApprovedInteractionCount, getLeaderboard, getPendingInteractions, getPendingPeople, getPeople } from "@/lib/data";

export default async function DashboardPage() {
  await requireApprovedUser();
  const [people, approvedCount, pendingInteractions, pendingPeople, leaderboard] = await Promise.all([
    getPeople(),
    getApprovedInteractionCount("year"),
    getPendingInteractions().catch(() => []),
    getPendingPeople().catch(() => []),
    getLeaderboard("year").catch(() => [])
  ]);

  return (
    <AppShell>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Family analytics, emotionally unnecessary</p>
          <h2 className="text-3xl font-black">Dashboard</h2>
        </section>
        <section className="grid gap-3 md:grid-cols-4">
          <StatCard label="Active people" value={people.filter((person) => person.active).length} detail="Roster, not evidence." />
          <StatCard label="Approved in 2026" value={approvedCount} detail="Documented affection, calendar-year edition." />
          <StatCard label="Pending approvals" value={pendingInteractions.length + pendingPeople.length} detail="Allegedly bonding." />
          <StatCard
            label="Top score"
            value={leaderboard[0]?.score?.total_score || 0}
            detail={leaderboard[0]?.name || "The throne is currently available."}
          />
        </section>
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-clay">2026 so far, allegedly</p>
              <h3 className="text-xl font-black">Current leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={leaderboard.slice(0, 5)} />
        </section>
      </div>
    </AppShell>
  );
}
