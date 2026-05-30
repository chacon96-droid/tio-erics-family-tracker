import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { FamilyShell } from "@/components/FamilyShell";
import { StatCard } from "@/components/StatCard";
import { TurtleRaceBreakdown } from "@/components/TurtleRaceBreakdown";
import { submitFamilyActivity } from "@/lib/family-actions";
import { getFamilyPersonInteractions, getFamilyYearlyBreakdowns, requireFamilyAccessPerson } from "@/lib/family-access";

export default async function FamilyMePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; submitted?: string }>;
}) {
  const [person, params] = await Promise.all([requireFamilyAccessPerson(), searchParams]);
  const [interactions, yearlyBreakdowns] = await Promise.all([
    getFamilyPersonInteractions(person.id),
    getFamilyYearlyBreakdowns(person.id)
  ]);
  const currentYear = new Date().getFullYear();
  const currentYearBreakdown = yearlyBreakdowns.find((item) => item.year === currentYear) || yearlyBreakdowns[0];

  return (
    <FamilyShell person={person}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-clay">{person.relationship}</p>
            <h2 className="text-3xl font-black">{person.name}</h2>
            <p className="mt-2 max-w-2xl font-semibold text-muted">
              Your personal scoreboard. If this feels accusatory, that is because numbers have no bedside manner.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label={`${currentYear} score`} value={currentYearBreakdown?.totalScore || 0} />
            <StatCard label={`Approved in ${currentYear}`} value={currentYearBreakdown?.approvedInteractionCount || 0} />
            <StatCard label="Awaiting Eric" value={currentYearBreakdown?.pendingInteractionCount || 0} detail="Pending, like a tiny courtroom." />
          </div>
          <TurtleRaceBreakdown person={person} breakdown={currentYearBreakdown} />
          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-clay">Recent receipts</p>
                <h3 className="text-xl font-black">Activity log</h3>
              </div>
              <Link href="/family/leaderboard" className="text-sm font-black text-ink underline-offset-4 hover:underline">
                View leaderboard
              </Link>
            </div>
            {interactions.length ? (
              <div className="rounded-app border border-line bg-white">
                {interactions.slice(0, 12).map((item) => (
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
          </div>
        </section>

        <section className="grid gap-4 self-start">
          {params?.error ? <p className="rounded-app bg-red-50 p-3 text-sm font-bold text-red-700">{params.error}</p> : null}
          {params?.submitted ? (
            <p className="rounded-app bg-green-50 p-3 text-sm font-bold text-green-800">
              Submitted for Eric approval. Due process, but make it family.
            </p>
          ) : null}
          <form action={submitFamilyActivity} className="grid gap-3 rounded-app border border-line bg-white p-4">
            <div>
              <p className="text-xs font-black uppercase text-clay">Claim quality time</p>
              <h3 className="text-xl font-black">Submit an activity</h3>
              <p className="mt-1 text-sm font-semibold text-muted">Fortnite, visits, actual effort. Eric approves it before it counts.</p>
            </div>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Type
              <select className="rounded-app border border-line px-3 py-2 text-ink" name="type">
                <option value="fortnite">Fortnite/gaming</option>
                <option value="visit">In-person visit</option>
                <option value="manual_activity">Manual activity</option>
                <option value="life_event">Life event check-in</option>
                <option value="birthday_remembered">Birthday remembered</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              When
              <input className="rounded-app border border-line px-3 py-2 text-ink" name="started_at" type="datetime-local" required />
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Minutes
              <input className="rounded-app border border-line px-3 py-2 text-ink" name="duration_minutes" type="number" min="0" defaultValue="0" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-muted">
              Notes
              <textarea className="min-h-24 rounded-app border border-line px-3 py-2 text-ink" name="notes" placeholder="State your case. Briefly. This is not a memoir." />
            </label>
            <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white">Submit for approval</button>
          </form>
        </section>
      </div>
    </FamilyShell>
  );
}
