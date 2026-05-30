import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
import { PersonForm } from "@/components/PersonForm";
import { StatCard } from "@/components/StatCard";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getPerson, getPersonInteractions, getPersonYearlyBreakdowns } from "@/lib/data";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireApprovedUser();
  const { id } = await params;
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
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label={`${currentYear} score`} value={currentYearBreakdown?.totalScore || 0} />
            <StatCard label={`Approved in ${currentYear}`} value={currentYearBreakdown?.approvedInteractionCount || 0} />
            <StatCard label={`Pending in ${currentYear}`} value={currentYearBreakdown?.pendingInteractionCount || 0} />
          </div>
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
            <DeletePersonButton personId={person.id} personName={person.name} />
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
