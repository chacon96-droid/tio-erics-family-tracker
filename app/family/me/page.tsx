import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { FamilyShell } from "@/components/FamilyShell";
import { StatCard } from "@/components/StatCard";
import { TurtleRaceBreakdown } from "@/components/TurtleRaceBreakdown";
import { submitFamilyActivity } from "@/lib/family-actions";
import { getFamilyLeaderboard, getFamilyPersonInteractions, getFamilyYearlyBreakdowns, requireFamilyAccessPerson } from "@/lib/family-access";
import { favorScoreForRow, maxTotalScore } from "@/lib/display-score";
import { badgeHints, profileRoast, qualityTimeNudge, scoreImprovementSuggestions } from "@/lib/family-lore";
import { leaderboardAudienceForRelationship } from "@/lib/relationships";

export default async function FamilyMePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; submitted?: string }>;
}) {
  const [person, params] = await Promise.all([requireFamilyAccessPerson(), searchParams]);
  const audience = leaderboardAudienceForRelationship(person.relationship);
  const [interactions, yearlyBreakdowns, leaderboard] = await Promise.all([
    getFamilyPersonInteractions(person.id),
    getFamilyYearlyBreakdowns(person.id),
    getFamilyLeaderboard("year", audience)
  ]);
  const currentYear = new Date().getFullYear();
  const currentYearBreakdown = yearlyBreakdowns.find((item) => item.year === currentYear) || yearlyBreakdowns[0];
  const leaderboardRow = leaderboard.find((row) => row.id === person.id);
  const leaderboardMax = maxTotalScore(leaderboard);
  const badges = badgeHints(person);
  const suggestions = scoreImprovementSuggestions(person, currentYearBreakdown);

  return (
    <FamilyShell person={person}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-clay">{person.relationship}</p>
            <h2 className="text-3xl font-black">{person.name}</h2>
            <p className="mt-2 max-w-2xl font-semibold text-muted">
              {profileRoast(person, { total_score: currentYearBreakdown?.totalScore || 0 })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black text-gold">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard
              label={`${currentYear} Tio Eric Aura Index`}
              value={leaderboardRow ? favorScoreForRow(leaderboardRow, leaderboardMax) : 0}
            />
            <StatCard label={`${currentYear} interactions tracked`} value={currentYearBreakdown?.approvedInteractionCount || 0} />
            <StatCard label="Awaiting Eric" value={currentYearBreakdown?.pendingInteractionCount || 0} detail="Pending, like a tiny courtroom." />
          </div>
          <TurtleRaceBreakdown person={person} breakdown={currentYearBreakdown} />
          <section className="rounded-app border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
            <p className="text-xs font-black uppercase text-clay">Score improvement plan</p>
            <h3 className="mt-1 text-xl font-black">How to climb, allegedly</h3>
            <p className="mt-1 text-sm font-semibold text-muted">
              Personalized recommendations from the Department of Unnecessary Measurement.
            </p>
            <div className="mt-4 grid gap-2">
              {suggestions.map((suggestion) => (
                <div key={suggestion} className="rounded-app border border-white/10 bg-ink/45 p-3 text-sm font-bold text-champagne/85">
                  {suggestion}
                </div>
              ))}
            </div>
          </section>
          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-clay">Recent receipts</p>
                <h3 className="text-xl font-black">Activity log</h3>
              </div>
              <Link href="/family/leaderboard" className="text-sm font-black text-gold underline-offset-4 hover:underline">
                View leaderboard
              </Link>
            </div>
            {interactions.length ? (
              <div className="rounded-app border border-white/10 bg-white/[0.06]">
                {interactions.slice(0, 12).map((item) => (
                  <div key={item.id} className="border-b border-white/10 p-4 last:border-b-0">
                    <div className="flex justify-between gap-4">
                      <p className="font-black">{item.type.replaceAll("_", " ")}</p>
                      <span className="text-sm font-bold text-muted">{item.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-muted">
                      {new Date(item.started_at).toLocaleString()} · {item.duration_minutes} min · {item.message_count} messages
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No interactions logged." body="A clean record, which is technically impressive and socially concerning." />
            )}
          </div>
        </section>

        <section className="grid gap-4 self-start">
          {params?.error ? <p className="rounded-app border border-red-400/35 bg-red-500/15 p-3 text-sm font-bold text-red-100">{params.error}</p> : null}
          {params?.submitted ? (
            <p className="rounded-app border border-mint/35 bg-mint/15 p-3 text-sm font-bold text-mint">
              Submitted for Eric approval. {qualityTimeNudge(person.id)}
            </p>
          ) : null}
          <form action={submitFamilyActivity} className="grid gap-3 rounded-app border border-white/10 bg-white/[0.06] p-4">
            <div>
              <p className="text-xs font-black uppercase text-clay">Claim quality time</p>
              <h3 className="text-xl font-black">Submit an activity</h3>
              <p className="mt-1 text-sm font-semibold text-muted">{qualityTimeNudge(person.name)}</p>
            </div>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Type
              <select className="rounded-app border border-white/15 bg-ink/60 px-3 py-2 text-ivory" name="type">
                <option value="fortnite">Fortnite/gaming</option>
                <option value="visit">In-person visit</option>
                <option value="manual_activity">Manual activity</option>
                <option value="life_event">Life event check-in</option>
                <option value="birthday_remembered">Birthday remembered</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              When
              <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-2 text-ivory" name="started_at" type="datetime-local" required />
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Minutes
              <input className="rounded-app border border-white/15 bg-ink/60 px-3 py-2 text-ivory" name="duration_minutes" type="number" min="0" defaultValue="0" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Notes
              <textarea className="min-h-24 rounded-app border border-white/15 bg-ink/60 px-3 py-2 text-ivory placeholder:text-champagne/35" name="notes" placeholder="State your case. Briefly. This is not a memoir." />
            </label>
            <button className="focus-ring rounded-app border border-gold bg-gold px-4 py-3 font-black text-ink">Submit for approval</button>
          </form>
        </section>
      </div>
    </FamilyShell>
  );
}
