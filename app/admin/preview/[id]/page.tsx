import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { TurtleRaceBreakdown } from "@/components/TurtleRaceBreakdown";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings, getLeaderboard, getPerson, getPersonInteractions, getPersonYearlyBreakdowns } from "@/lib/data";
import { favorScoreForRow, formatRawScore, maxTotalScore } from "@/lib/display-score";
import { leaderboardAudienceForRelationship } from "@/lib/relationships";

export default async function FamilyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [person, interactions, yearlyBreakdowns, leaderboard, settings] = await Promise.all([
    getPerson(id),
    getPersonInteractions(id),
    getPersonYearlyBreakdowns(id),
    getLeaderboard("year").catch(() => []),
    getAppSettings().catch((): Record<string, unknown> => ({}))
  ]);

  if (!person) notFound();

  const currentYear = new Date().getFullYear();
  const currentYearBreakdown = yearlyBreakdowns.find((item) => item.year === currentYear) || yearlyBreakdowns[0];
  const approvedInteractions = interactions.filter((item) => item.status === "approved");
  const limitedLeaderboardEnabled = settings.limited_family_leaderboard_enabled !== false;
  const audience = leaderboardAudienceForRelationship(person.relationship);
  const audienceRows = leaderboard.filter((row) => leaderboardAudienceForRelationship(row.relationship) === audience);
  const leaderboardRow = audienceRows.find((row) => row.id === person.id);
  const leaderboardMax = maxTotalScore(audienceRows);

  return (
    <AppShell previewMode>
      <div className="grid gap-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-clay">Admin preview</p>
            <h2 className="text-3xl font-black">{person.name}'s view</h2>
            <p className="mt-1 max-w-2xl font-semibold text-muted">
              This is the family-facing version for {person.name}. No edit buttons, no admin tools, no behind-the-curtain nonsense.
            </p>
          </div>
          <Link href={`/people/${person.id}`} className="rounded-app border border-line bg-white px-4 py-3 text-sm font-black">
            Back to admin profile
          </Link>
        </section>

        {!person.active ? (
          <section className="rounded-app border border-amber-200 bg-amber-50 p-4 font-bold text-amber-950">
            They are still pending approval, so their real login lands on the waiting room. Bureaucracy, but make it family.
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-4">
          <StatCard
            label={`${currentYear} Aura Index`}
            value={leaderboardRow ? favorScoreForRow(leaderboardRow, leaderboardMax) : 0}
            detail={`${formatRawScore(currentYearBreakdown?.totalScore)} raw points.`}
          />
          <StatCard label="Approved activity" value={approvedInteractions.length} detail="Counts after Eric's royal blessing." />
          <StatCard label="Minutes logged" value={Math.round(currentYearBreakdown?.totalMinutes || 0)} detail="Actual talking, allegedly." />
          <StatCard label="Messages counted" value={currentYearBreakdown?.messageCount || 0} detail="No message content stored." />
        </section>

        <TurtleRaceBreakdown person={person} breakdown={currentYearBreakdown} />

        <section>
          <div className="mb-3">
            <p className="text-xs font-black uppercase text-clay">Their receipts</p>
            <h3 className="text-xl font-black">Activity breakdown</h3>
          </div>
          {yearlyBreakdowns.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {yearlyBreakdowns.map((year) => (
                <div key={year.year} className="rounded-app border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-clay">{year.topCategory}</p>
                      <h4 className="text-2xl font-black">{year.year}</h4>
                    </div>
                    <p className="text-2xl font-black">{formatRawScore(year.totalScore)}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <p><strong>{year.callCount}</strong><br /><span className="font-semibold text-muted">Calls</span></p>
                    <p><strong>{year.textExchangeCount}</strong><br /><span className="font-semibold text-muted">Text exchanges</span></p>
                    <p><strong>{Math.round(year.totalMinutes)}</strong><br /><span className="font-semibold text-muted">Minutes</span></p>
                    <p><strong>{year.pendingInteractionCount}</strong><br /><span className="font-semibold text-muted">Pending</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No approved activity yet." body="A bold attempt to win the leaderboard through pure vibes." />
          )}
        </section>

        {limitedLeaderboardEnabled ? (
          <section>
            <div className="mb-3">
              <p className="text-xs font-black uppercase text-clay">What they can compare</p>
              <h3 className="text-xl font-black">
                {audience === "friends" ? "Family friends leaderboard" : "Family leaderboard"}
              </h3>
            </div>
            <LeaderboardTable rows={leaderboard.filter((row) => leaderboardAudienceForRelationship(row.relationship) === audience).slice(0, 5)} />
          </section>
        ) : (
          <section className="rounded-app border border-line bg-white p-4 font-bold text-muted">
            Limited leaderboard is currently hidden from family members. Very cloak-and-dagger. Mostly cloak.
          </section>
        )}
      </div>
    </AppShell>
  );
}
