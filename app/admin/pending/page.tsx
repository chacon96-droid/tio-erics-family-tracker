import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { requireAdmin } from "@/lib/auth";
import { getPendingWeeklyStats } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "No activity yet";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default async function PendingDashboardPage() {
  await requireAdmin();
  const stats = await getPendingWeeklyStats();
  const totalProjected = stats.reduce((sum, person) => sum + person.projectedScore, 0);
  const totalMinutes = stats.reduce((sum, person) => sum + person.totalMinutes, 0);
  const totalPendingClaims = stats.reduce((sum, person) => sum + person.pendingInteractionCount, 0);
  const leader = stats[0];

  return (
    <AppShell>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Pending roster analytics, legally still vibes</p>
          <h2 className="text-3xl font-black">Unapproved weekly dashboard</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-muted">
            A provisional scoreboard for people waiting on your approval. These numbers do not hit the real leaderboard
            until you approve the person and the activity. Democracy remains unavailable.
          </p>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <StatCard label="Pending people" value={stats.length} detail="Hopeful applicants." />
          <StatCard label="Projected points" value={Math.round(totalProjected * 10) / 10} detail="Imaginary, but organized." />
          <StatCard label="Logged minutes" value={totalMinutes} detail="This week, pending review." />
          <StatCard label="Pending claims" value={totalPendingClaims} detail="Paperwork with feelings." />
        </section>

        {stats.length ? (
          <section className="overflow-hidden rounded-app border border-line bg-white">
            <div className="border-b border-line bg-paper p-4">
              <p className="text-xs font-black uppercase text-clay">Current front-runner</p>
              <h3 className="text-xl font-black">
                {leader?.name || "Nobody"} {leader ? `with ${leader.projectedScore} provisional points` : ""}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-line">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Person</th>
                    <th className="p-3">Projected</th>
                    <th className="p-3">Share</th>
                    <th className="p-3">Calls</th>
                    <th className="p-3">Texts</th>
                    <th className="p-3">Minutes</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((person, index) => (
                    <tr key={person.id} className="border-b border-line last:border-b-0">
                      <td className="p-3 font-black">{index + 1}</td>
                      <td className="p-3">
                        <Link href={`/people/${person.id}`} className="font-black text-ink underline-offset-4 hover:underline">
                          {person.name}
                        </Link>
                        <p className="text-xs font-semibold text-muted">{person.relationship}</p>
                      </td>
                      <td className="p-3 font-black">{person.projectedScore}</td>
                      <td className="p-3 font-semibold">{person.projectedShare.toFixed(1)}%</td>
                      <td className="p-3">{person.callCount}</td>
                      <td className="p-3">
                        {person.textExchangeCount}
                        <p className="text-xs font-semibold text-muted">{person.messageCount} messages</p>
                      </td>
                      <td className="p-3">
                        {person.totalMinutes}
                        <p className="text-xs font-semibold text-muted">{person.qualityTimeMinutes} quality-time min</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{person.pendingInteractionCount} pending</p>
                        <p className="text-xs font-semibold text-muted">
                          {person.importedInteractionCount} imported · {person.manualInteractionCount} manual
                        </p>
                      </td>
                      <td className="p-3 font-semibold text-muted">{formatDate(person.latestInteractionAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <EmptyState
            title="No unapproved members to analyze."
            body="The velvet rope is quiet. Disturbing, but administratively convenient."
          />
        )}
      </div>
    </AppShell>
  );
}
