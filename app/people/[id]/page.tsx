import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
import { PersonForm } from "@/components/PersonForm";
import { StatCard } from "@/components/StatCard";
import { TurtleRaceBreakdown } from "@/components/TurtleRaceBreakdown";
import { updateMyProfilePhoto } from "@/lib/actions";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getLeaderboard, getPerson, getPersonInteractions, getPersonYearlyBreakdowns } from "@/lib/data";
import { favorScoreForRow, formatRawScore, maxTotalScore } from "@/lib/display-score";
import { badgeHints, profileRoast } from "@/lib/family-lore";
import { leaderboardAudienceForRelationship } from "@/lib/relationships";

export default async function PersonPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ removed?: string; error?: string }>;
}) {
  await requireApprovedUser();
  const { id } = await params;
  const query = (await searchParams) || {};
  const [person, interactions, yearlyBreakdowns, profile, leaderboard] = await Promise.all([
    getPerson(id),
    getPersonInteractions(id),
    getPersonYearlyBreakdowns(id),
    getProfile(),
    getLeaderboard("year").catch(() => [])
  ]);
  if (!person) notFound();
  const currentYear = new Date().getFullYear();
  const currentYearBreakdown = yearlyBreakdowns.find((item) => item.year === currentYear) || yearlyBreakdowns[0];
  const audience = leaderboardAudienceForRelationship(person.relationship);
  const audienceRows = leaderboard.filter((row) => leaderboardAudienceForRelationship(row.relationship) === audience);
  const leaderboardRow = audienceRows.find((row) => row.id === person.id);
  const leaderboardMax = maxTotalScore(audienceRows);
  const badges = badgeHints(person);

  return (
    <AppShell>
      <div className="grid gap-6">
        {profile?.role === "admin" ? (
          <section className="grid gap-3 rounded-app border border-line bg-paper/60 p-4">
            <div>
              <p className="text-xs font-black uppercase text-clay">Admin edit</p>
              <h3 className="text-xl font-black">Profile controls</h3>
            </div>
            <PersonForm person={person} layout="wide" />
            <DeletePersonButton personId={person.id} personName={person.name} returnTo="/leaderboard" />
          </section>
        ) : null}
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-clay">{person.relationship}</p>
            <h2 className="text-3xl font-black">{person.name}</h2>
            <p className="mt-2 max-w-2xl font-semibold text-muted">
              {profileRoast(person, { total_score: currentYearBreakdown?.totalScore || 0 })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-black text-clay">
                  {badge}
                </span>
              ))}
            </div>
            {query.error ? (
              <div className="mt-4 rounded-app border border-red-200 bg-red-50 p-3 text-sm font-black text-red-800">
                Could not remove that profile: {query.error}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard
              label={`${currentYear} Aura Index`}
              value={leaderboardRow ? favorScoreForRow(leaderboardRow, leaderboardMax) : 0}
              detail={`${formatRawScore(currentYearBreakdown?.totalScore)} raw points`}
            />
            <StatCard label={`Approved in ${currentYear}`} value={currentYearBreakdown?.approvedInteractionCount || 0} />
            <StatCard label={`Pending in ${currentYear}`} value={currentYearBreakdown?.pendingInteractionCount || 0} />
          </div>
          <TurtleRaceBreakdown person={person} breakdown={currentYearBreakdown} />
          {yearlyBreakdowns.length ? (
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-black uppercase text-clay">Calendar-year breakdown</p>
                <h3 className="text-xl font-black">Receipts by year</h3>
              </div>
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
                      <div>
                        <p className="font-black">{year.callCount}</p>
                        <p className="font-semibold text-muted">Calls</p>
                      </div>
                      <div>
                        <p className="font-black">{year.textExchangeCount}</p>
                        <p className="font-semibold text-muted">Text exchanges</p>
                      </div>
                      <div>
                        <p className="font-black">{Math.round(year.totalMinutes)}</p>
                        <p className="font-semibold text-muted">Minutes logged</p>
                      </div>
                      <div>
                        <p className="font-black">{year.messageCount}</p>
                        <p className="font-semibold text-muted">Messages counted</p>
                      </div>
                      <div>
                        <p className="font-black">{year.approvedInteractionCount}</p>
                        <p className="font-semibold text-muted">Approved</p>
                      </div>
                      <div>
                        <p className="font-black">{year.pendingInteractionCount}</p>
                        <p className="font-semibold text-muted">Pending judgment</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-muted">
                      Calls: {formatRawScore(year.callScore)} raw · Texts: {formatRawScore(year.textScore)} raw
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {interactions.length ? (
            <div className="rounded-app border border-line bg-white">
              {interactions.map((item) => (
                <div key={item.id} className="border-b border-line p-4 last:border-b-0">
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
        </section>
        {profile?.role !== "admin" && profile?.id === person.user_id ? (
          <section>
            <form action={updateMyProfilePhoto} encType="multipart/form-data" className="grid gap-3 rounded-app border border-line bg-white p-4">
              <input type="hidden" name="person_id" value={person.id} />
              <div className="grid justify-items-start gap-3">
                <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-line bg-paper text-2xl font-black text-clay">
                  {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover" /> : person.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-clay">Profile photo</p>
                  <h3 className="text-xl font-black">Update your racer</h3>
                </div>
              </div>
              <label className="grid gap-1 text-sm font-bold text-muted">
                Take or upload a photo
                <input className="rounded-app border border-line px-3 py-2 text-ink" name="avatar_file" type="file" required />
              </label>
              <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white">Save racer photo</button>
            </form>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
