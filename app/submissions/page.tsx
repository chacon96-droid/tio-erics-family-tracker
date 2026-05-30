import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { requireApprovedUser } from "@/lib/auth";
import { getInteractions } from "@/lib/data";
import { approvalQueueCopy } from "@/lib/family-lore";

export default async function SubmissionsPage() {
  await requireApprovedUser();
  const interactions = await getInteractions();

  return (
    <AppShell>
      <section>
        <p className="text-xs font-black uppercase text-clay">Claims department</p>
        <h2 className="mb-4 text-3xl font-black">Submissions</h2>
        {interactions.length ? (
          <div className="rounded-app border border-line bg-white">
            {interactions.map((item) => (
              <div key={item.id} className="border-b border-line p-4 last:border-b-0">
                <div className="flex justify-between gap-4">
                  <p className="font-black">{item.type.replaceAll("_", " ")}</p>
                  <span className="font-bold text-clay">{item.status}</span>
                </div>
                <p className="text-sm font-semibold text-muted">
                  {new Date(item.started_at).toLocaleString()} · {item.duration_minutes} minutes
                </p>
                {item.status === "pending" ? <p className="mt-2 text-sm font-semibold text-muted">{approvalQueueCopy(item.id)}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No submissions yet. Bold strategy." body="Hard to get credit for quality time no one has admitted to." />
        )}
      </section>
    </AppShell>
  );
}
