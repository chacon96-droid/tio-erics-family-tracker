import { AppShell } from "@/components/AppShell";
import { setInteractionStatus } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getPendingInteractions } from "@/lib/data";

export default async function ApprovalsPage() {
  await requireAdmin();
  const pending = await getPendingInteractions();

  return (
    <AppShell>
      <section>
        <p className="text-xs font-black uppercase text-clay">Admin queue</p>
        <h2 className="mb-4 text-3xl font-black">Approvals</h2>
        <div className="grid gap-3">
          {pending.map((item: any) => (
            <article key={item.id} className="rounded-app border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black">{item.people?.name || "Unknown person"}</p>
                  <p className="text-sm font-semibold text-muted">
                    {item.type.replaceAll("_", " ")} · {item.duration_minutes} min · {item.message_count} messages
                  </p>
                  {item.notes ? <p className="mt-2 text-sm text-muted">{item.notes}</p> : null}
                </div>
                <div className="flex gap-2">
                  <form action={setInteractionStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-app bg-ink px-3 py-2 text-sm font-black text-white">Approve</button>
                  </form>
                  <form action={setInteractionStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="denied" />
                    <button className="rounded-app border border-line bg-white px-3 py-2 text-sm font-black">Deny</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
