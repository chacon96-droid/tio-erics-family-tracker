import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { PersonForm } from "@/components/PersonForm";
import { getProfile, requireApprovedUser } from "@/lib/auth";
import { getPeople } from "@/lib/data";

export default async function PeoplePage() {
  await requireApprovedUser();
  const [people, profile] = await Promise.all([getPeople(), getProfile()]);
  const isAdmin = profile?.role === "admin";

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="text-xs font-black uppercase text-clay">Family roster</p>
          <h2 className="text-3xl font-black">People</h2>
          {people.length ? (
            <div className="mt-4 overflow-hidden rounded-app border border-line bg-white">
              {people.map((person) => (
                <div key={person.id} className="border-b border-line p-4 last:border-b-0 hover:bg-paper">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/people/${person.id}`} className="font-black underline-offset-4 hover:underline">
                        {person.name}
                      </Link>
                      <p className="text-sm font-semibold text-muted">{person.relationship}</p>
                    </div>
                    <div className="grid justify-items-end gap-1">
                      <span className="text-sm font-bold text-muted">{person.active ? "Active" : "Inactive"}</span>
                      {isAdmin ? (
                        <Link href={`/admin/preview/${person.id}`} className="text-xs font-black uppercase text-clay underline-offset-4 hover:underline">
                          Preview family view
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No one in the roster yet." body="The dynasty begins, as all great dynasties do, with data entry." />
            </div>
          )}
        </section>
        {isAdmin ? (
          <section>
            <p className="mb-2 text-xs font-black uppercase text-clay">Admin</p>
            <PersonForm />
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
