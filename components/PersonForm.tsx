import { savePerson } from "@/lib/actions";
import { normalizeRelationship, relationshipOptions } from "@/lib/relationships";
import type { Person } from "@/lib/types";

export function PersonForm({ person, layout = "stacked" }: { person?: Person | null; layout?: "stacked" | "wide" }) {
  const selectedRelationship = normalizeRelationship(person?.relationship);
  const fieldGridClass = layout === "wide" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-4" : "grid gap-3 sm:grid-cols-2";

  return (
    <form action={savePerson} encType="multipart/form-data" className="grid gap-4 rounded-app border border-line bg-white p-4">
      {person?.id ? <input type="hidden" name="id" value={person.id} /> : null}
      {person?.avatar_url ? <input type="hidden" name="avatar_url" value={person.avatar_url} /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-line bg-paper text-xl font-black text-clay">
          {person?.avatar_url ? <img src={person.avatar_url} alt="" className="h-full w-full object-cover" /> : person?.name?.slice(0, 1) || "?"}
        </div>
        <label className="grid flex-1 gap-1 text-sm font-bold text-muted">
          Profile photo
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="avatar_file" type="file" accept="image/*" capture="user" />
        </label>
      </div>
      <div className={fieldGridClass}>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Name
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="name" defaultValue={person?.name} required />
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Relationship
          <select className="rounded-app border border-line px-3 py-2 text-ink" name="relationship" defaultValue={selectedRelationship} required>
            <option value="" disabled>
              Pick a relationship
            </option>
            {relationshipOptions.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
            {selectedRelationship && !(relationshipOptions as readonly string[]).includes(selectedRelationship) ? (
              <option value={selectedRelationship}>{selectedRelationship}</option>
            ) : null}
          </select>
        </label>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="active" defaultChecked={person?.active ?? true} />
          Active
        </label>
        <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white sm:min-w-40">Save person</button>
      </div>
    </form>
  );
}
