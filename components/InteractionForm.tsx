import { createInteraction } from "@/lib/actions";
import type { Person } from "@/lib/types";

export function InteractionForm({ people }: { people: Person[] }) {
  return (
    <form action={createInteraction} className="grid gap-3 rounded-app border border-line bg-white p-4">
      <label className="grid gap-1 text-sm font-bold text-muted">
        Person
        <select className="rounded-app border border-line px-3 py-2 text-ink" name="person_id" required>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-muted">
          Type
          <select className="rounded-app border border-line px-3 py-2 text-ink" name="type">
            <option value="call">Call</option>
            <option value="missed_call_returned">Returned missed call</option>
            <option value="text_exchange">Text exchange</option>
            <option value="fortnite">Fortnite/gaming</option>
            <option value="visit">In-person visit</option>
            <option value="manual_activity">Manual activity</option>
            <option value="life_event">Life event check-in</option>
            <option value="birthday_remembered">Birthday remembered</option>
            <option value="admin_bonus">Admin bonus</option>
            <option value="admin_penalty">Admin penalty</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Direction
          <select className="rounded-app border border-line px-3 py-2 text-ink" name="direction">
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="mutual">Mutual</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Started at
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="started_at" type="datetime-local" required />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-muted">
          Duration minutes / custom points
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="duration_minutes" type="number" min="0" defaultValue="0" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-muted">
          Message count
          <input className="rounded-app border border-line px-3 py-2 text-ink" name="message_count" type="number" min="0" defaultValue="0" />
        </label>
        <label className="mt-6 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" name="initiated_by_person" />
          Person initiated
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="is_group_chat" />
        Group chat
      </label>
      <label className="grid gap-1 text-sm font-bold text-muted">
        Notes
        <textarea className="min-h-24 rounded-app border border-line px-3 py-2 text-ink" name="notes" />
      </label>
      <button className="focus-ring rounded-app bg-ink px-4 py-3 font-black text-white">Submit interaction</button>
    </form>
  );
}
