import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { requireApprovedUser } from "@/lib/auth";
import { getInteractions, getLeaderboard, getPendingInteractions, getPeople } from "@/lib/data";

export default async function DashboardPage() {
  await requireApprovedUser();
  const [people, interactions, pending, leaderboard] = await Promise.all([
    getPeople(),
    getInteractions("month"),
    getPendingInteractions().catch(() => []),
    getLeaderboard("month").catch(() => [])
  ]);

  const approved = interactions.filter((item) => item.status === "approved");

  return (
    <AppShell>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Family analytics, emotionally unnecessary</p>
          <h2 className="text-3xl font-black">Dashboard</h2>
        </section>
        <section className="grid gap-3 md:grid-cols-4">
          <StatCard label="Active people" value={people.filter((person) => person.active).length} detail="Roster, not evidence." />
          <StatCard label="Approved this month" value={approved.length} detail="Documented affection." />
          <StatCard label="Pending approvals" value={pending.length} detail="Allegedly bonding." />
          <StatCard
            label="Top score"
            value={leaderboard[0]?.score?.total_score || 0}
            detail={leaderboard[0]?.name || "The throne is currently available."}
          />
        </section>
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-clay">This month, allegedly</p>
              <h3 className="text-xl font-black">Current leaderboard</h3>
            </div>
          </div>
          <LeaderboardTable rows={leaderboard.slice(0, 5)} />
        </section>
      </div>
    </AppShell>
  );
}
