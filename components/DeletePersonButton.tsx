"use client";

import { deletePerson } from "@/lib/actions";

type DeletePersonButtonProps = {
  personId: string;
  personName: string;
};

export function DeletePersonButton({ personId, personName }: DeletePersonButtonProps) {
  return (
    <form
      action={deletePerson}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove ${personName} from the roster? Their interactions, scores, and badges will also disappear. Extremely clean. Mildly dramatic.`
        );
        if (!confirmed) event.preventDefault();
      }}
      className="rounded-app border border-red-200 bg-red-50 p-4"
    >
      <input type="hidden" name="person_id" value={personId} />
      <p className="text-xs font-black uppercase text-red-700">Danger-ish zone</p>
      <p className="mt-1 text-sm font-semibold text-red-900">
        Remove this profile and wipe their leaderboard footprint. For test profiles, this is housekeeping. For real family, this is how Thanksgiving gets weird.
      </p>
      <button className="mt-3 rounded-app bg-red-700 px-4 py-3 font-black text-white hover:bg-red-800">
        Remove from roster
      </button>
    </form>
  );
}
