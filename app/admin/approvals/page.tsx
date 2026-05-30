import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { approveFamilyMember, setInteractionStatus } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getPendingInteractions, getPendingPeople } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requireAdmin();
  const [pending, pendingPeople] = await Promise.all([getPendingInteractions(), getPendingPeople()]);

  return (
    <AppShell>
      <section>
        <p className="text-xs font-black uppercase text-clay">Admin queue, court is in session</p>
        <h2 className="mb-4 text-3xl font-black">Approvals</h2>
        <div className="mb-6 grid gap-3">
          <h3 className="text-xl font-black">Roster requests</h3>
          {pendingPeople.length ? (
            pendingPeople.map((person) => (
              <article key={person.id} className="rounded-app border border-line bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">{person.name}</p>
                    <p className="text-sm font-semibold text-muted">
                      {person.relationship} · {person.email || "No email, bold"} · {person.phone || "No phone"}
                    </p>
                  </div>
                  <form action={approveFamilyMember}>
                    <input type="hidden" name="person_id" value={person.id} />
                    <input type="hidden" name="user_id" value={person.user_id || ""} />
                    <button className="rounded-app bg-ink px-3 py-2 text-sm font-black text-white">Approve roster spot</button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No roster requests." body="No one is begging for points at the moment. Growth opportunity." />
          )}
        </div>
        <h3 className="mb-3 text-xl font-black">Activity claims</h3>
        {pending.length ? (
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
        ) : (
          <EmptyState title="No pending claims." body="Peace, briefly." />
        )}
      </section>
    </AppShell>
  );
}
