import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PersonForm } from "@/components/PersonForm";
import { StatCard } from "@/components/StatCard";
import { getProfile, requireUser } from "@/lib/auth";
import { getPerson, getPersonInteractions, getScores } from "@/lib/data";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const [person, interactions, scores, profile] = await Promise.all([
    getPerson(id),
    getPersonInteractions(id),
    getScores("all_time").catch(() => []),
    getProfile()
  ]);
  if (!person) notFound();
  const score = scores.find((item) => item.person_id === person.id);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-black uppercase text-clay">{person.relationship}</p>
            <h2 className="text-3xl font-black">{person.name}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="All-time score" value={score?.total_score || 0} />
            <StatCard label="Approved interactions" value={interactions.filter((item) => item.status === "approved").length} />
            <StatCard label="Pending" value={interactions.filter((item) => item.status === "pending").length} />
          </div>
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
        </section>
        {profile?.role === "admin" ? <PersonForm person={person} /> : null}
      </div>
    </AppShell>
  );
}
