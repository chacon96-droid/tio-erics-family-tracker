import { savePerson } from "@/lib/actions";
import type { Person } from "@/lib/types";

export function PersonForm({ person }: { person?: Person | null }) {
  return (
    <form action={savePerson} className="grid gap-3 rounded-app border border-line bg-white p-4">
      {person?.id ? <input type="hidden" name="id" value={person.id} /> : null}
      <label className="grid gap-1 text-sm font-bold text-muted">
        Name
        <input className="rounded-app border border-line px-3 py-2 text-ink" name="name" defaultValue={person?.name} required />
      </label>
      <label className="grid gap-1 text-sm font-bold text-muted">
        Relationship
        <input className="rounded-app border border-line px-3 py-2 text-ink" name="relationship" defaultValue={person?.relationship} required />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-muted">
          Phone
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="phone" defaultValue={person?.phone || ""} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Email
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="email" defaultValue={person?.email || ""} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Birthday
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="birthday" type="date" defaultValue={person?.birthday || ""} />
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Age bracket
          <select className="rounded-app border border-line px-3 py-2 text-ink" name="age_bracket" defaultValue={person?.age_bracket || "unknown"}>
            <option value="unknown">Unknown</option>
            <option value="kid">Kid</option>
            <option value="teen">Teen</option>
            <option value="adult">Adult</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="active" defaultChecked={person?.active ?? true} />
        Active
      </label>
      <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white">Save person</button>
    </form>
  );
}
