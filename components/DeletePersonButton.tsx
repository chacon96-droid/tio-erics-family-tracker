type DeletePersonButtonProps = {
  personId: string;
  personName: string;
  variant?: "card" | "inline";
  returnTo?: string;
};

export function DeletePersonButton({ personId, personName, variant = "card", returnTo = "/people" }: DeletePersonButtonProps) {
  const isInline = variant === "inline";
  const href = `/people/remove?person_id=${encodeURIComponent(personId)}&return_to=${encodeURIComponent(returnTo)}`;

  return (
    <div className={isInline ? "" : "rounded-app border border-red-200 bg-red-50 p-4"}>
      {isInline ? null : (
        <>
          <p className="text-xs font-black uppercase text-red-700">Danger-ish zone</p>
          <p className="mt-1 text-sm font-semibold text-red-900">
            Remove {personName} and wipe their leaderboard footprint. For test profiles, this is housekeeping. For real family, this is how Thanksgiving gets weird.
          </p>
        </>
      )}
      <a
        href={href}
        className={
          isInline
            ? "inline-block rounded-app border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase text-red-700 hover:bg-red-100"
            : "mt-3 inline-block rounded-app bg-red-700 px-4 py-3 font-black text-white hover:bg-red-800"
        }
      >
        {isInline ? "Remove" : "Remove from roster"}
      </a>
    </div>
  );
}
