import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getInteractions } from "@/lib/data";

export default async function SubmissionsPage() {
  await requireUser();
  const interactions = await getInteractions();

  return (
    <AppShell>
      <section>
        <p className="text-xs font-black uppercase text-clay">Approval status</p>
        <h2 className="mb-4 text-3xl font-black">Submissions</h2>
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
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
