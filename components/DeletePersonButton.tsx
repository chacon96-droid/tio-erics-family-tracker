"use client";

import { useFormStatus } from "react-dom";
import { deletePerson } from "@/lib/actions";

type DeletePersonButtonProps = {
  personId: string;
  personName: string;
  variant?: "card" | "inline";
};

export function DeletePersonButton({ personId, personName, variant = "card" }: DeletePersonButtonProps) {
  const isInline = variant === "inline";

  return (
    <form
      action={deletePerson}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove ${personName} from the roster? Their interactions, scores, and badges will also disappear. Extremely clean. Mildly dramatic.`
        );
        if (!confirmed) event.preventDefault();
      }}
      className={isInline ? "" : "rounded-app border border-red-200 bg-red-50 p-4"}
    >
      <input type="hidden" name="person_id" value={personId} />
      {isInline ? null : (
        <>
          <p className="text-xs font-black uppercase text-red-700">Danger-ish zone</p>
          <p className="mt-1 text-sm font-semibold text-red-900">
            Remove this profile and wipe their leaderboard footprint. For test profiles, this is housekeeping. For real family, this is how Thanksgiving gets weird.
          </p>
        </>
      )}
      <DeleteSubmitButton variant={variant} />
    </form>
  );
}

function DeleteSubmitButton({ variant }: { variant: "card" | "inline" }) {
  const { pending } = useFormStatus();
  const isInline = variant === "inline";

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        isInline
          ? "rounded-app border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-70"
          : "mt-3 rounded-app bg-red-700 px-4 py-3 font-black text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-70"
      }
    >
      {pending ? "Removing..." : isInline ? "Remove" : "Remove from roster"}
    </button>
  );
}
