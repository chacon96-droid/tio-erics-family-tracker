import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
import { PersonForm } from "@/components/PersonForm";
import { StatCard } from "@/components/StatCard";
import { TurtleRaceBreakdown } from "@/components/TurtleRaceBreakdown";
import { updateMyProfilePhoto } from "@/lib/actions";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getPerson, getPersonInteractions, getPersonYearlyBreakdowns } from "@/lib/data";

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
  const [person, interactions, yearlyBreakdowns, profile] = await Promise.all([
    getPerson(id),
    getPersonInteractions(id),
    getPersonYearlyBreakdowns(id),
    getProfile()
  ]);
  if (!person) notFound();
  const currentYear = new Date().getFullYear();
  const currentYearBreakdown = yearlyBreakdowns.find((item) => item.year === currentYear) || yearlyBreakdowns[0];

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-clay">{person.relationship}</p>
            <h2 className="text-3xl font-black">{person.name}</h2>
            {query.error ? (
              <div className="mt-4 rounded-app border border-red-200 bg-red-50 p-3 text-sm font-black text-red-800">
                Could not remove that profile: {query.error}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label={`${currentYear} score`} value={currentYearBreakdown?.totalScore || 0} />
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
                      <p className="text-2xl font-black">{year.totalScore}</p>
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
                      Calls: {Math.round(year.callScore * 10) / 10} pts · Texts: {Math.round(year.textScore * 10) / 10} pts
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
        {profile?.role === "admin" ? (
          <section className="grid gap-4">
            <PersonForm person={person} />
            <DeletePersonButton personId={person.id} personName={person.name} returnTo="/leaderboard" />
          </section>
        ) : profile?.id === person.user_id ? (
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
                <input className="rounded-app border border-line px-3 py-2 text-ink" name="avatar_file" type="file" accept="image/*" capture="user" required />
              </label>
              <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white">Save racer photo</button>
            </form>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
