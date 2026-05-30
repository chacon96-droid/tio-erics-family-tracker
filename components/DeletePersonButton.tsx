"use client";

import { useState } from "react";

type DeletePersonButtonProps = {
  personId: string;
  personName: string;
  variant?: "card" | "inline";
  returnTo?: string;
};

export function DeletePersonButton({ personId, personName, variant = "card", returnTo = "/people" }: DeletePersonButtonProps) {
  const isInline = variant === "inline";
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  async function removePerson() {
    setError("");
    const confirmed = window.confirm(
      `Remove ${personName} from the roster? Their interactions, scores, and badges will also disappear. Extremely clean. Mildly dramatic.`
    );
    if (!confirmed) return;

    setIsRemoving(true);
    const formData = new FormData();
    formData.set("person_id", personId);
    formData.set("return_to", returnTo);

    try {
      const response = await fetch("/people/remove", {
        method: "POST",
        body: formData,
        headers: {
          accept: "application/json",
          "x-requested-with": "fetch"
        }
      });
      const result = (await response.json()) as { ok?: boolean; redirectTo?: string; message?: string };

      if (result.redirectTo && (response.ok || result.ok)) {
        window.location.assign(result.redirectTo);
        return;
      }

      setError(result.message || "Could not remove that profile. The roster is being dramatic.");
      setIsRemoving(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not remove that profile.");
      setIsRemoving(false);
    }
  }

  return (
    <div className={isInline ? "" : "rounded-app border border-red-200 bg-red-50 p-4"}>
      {isInline ? null : (
        <>
          <p className="text-xs font-black uppercase text-red-700">Danger-ish zone</p>
          <p className="mt-1 text-sm font-semibold text-red-900">
            Remove this profile and wipe their leaderboard footprint. For test profiles, this is housekeeping. For real family, this is how Thanksgiving gets weird.
          </p>
        </>
      )}
      <DeleteSubmitButton variant={variant} isRemoving={isRemoving} onClick={removePerson} />
      {error ? <p className="mt-2 text-sm font-black text-red-700">{error}</p> : null}
    </div>
  );
}

function DeleteSubmitButton({ variant, isRemoving, onClick }: { variant: "card" | "inline"; isRemoving: boolean; onClick: () => void }) {
  const isInline = variant === "inline";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isRemoving}
      className={
        isInline
          ? "rounded-app border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase text-red-700 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
          : "mt-3 rounded-app bg-red-700 px-4 py-3 font-black text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
      }
    >
      {isRemoving ? "Removing..." : isInline ? "Remove" : "Remove from roster"}
    </button>
  );
}
