import { AppShell } from "@/components/AppShell";
import { InteractionForm } from "@/components/InteractionForm";
import { requireUser } from "@/lib/auth";
import { getPeople } from "@/lib/data";

export default async function NewInteractionPage() {
  await requireUser();
  const people = await getPeople();

  return (
    <AppShell>
      <section className="max-w-3xl">
        <p className="text-xs font-black uppercase text-clay">Manual submission</p>
        <h2 className="mb-4 text-3xl font-black">New interaction</h2>
        <InteractionForm people={people} />
      </section>
    </AppShell>
  );
}
