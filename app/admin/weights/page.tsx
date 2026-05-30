import { AppShell } from "@/components/AppShell";
import { recalculateScores, updateWeight } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { getScoringWeights } from "@/lib/data";

export default async function WeightsPage({ searchParams }: { searchParams?: Promise<{ recalculated?: string; rows?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const weights = await getScoringWeights();
  const refreshedRows = Number(params?.rows || 0);

  return (
    <AppShell>
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-clay">Formula controls</p>
            <h2 className="text-3xl font-black">Scoring weights</h2>
          </div>
          <form action={recalculateScores}>
            <button className="rounded-app bg-ink px-4 py-3 font-black text-white">Recalculate scores</button>
          </form>
        </div>
        {params?.recalculated ? (
          <div className="mb-4 rounded-app border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-900">
            Scores recalculated. {refreshedRows} leaderboard rows refreshed. The spreadsheet blinked first.
          </div>
        ) : null}
        <div className="grid gap-3">
          {weights.map((weight) => (
            <form key={weight.id} action={updateWeight} className="grid gap-3 rounded-app border border-line bg-white p-4 xl:grid-cols-[1.4fr_repeat(6,1fr)_auto]">
              <input type="hidden" name="id" value={weight.id} />
              <label className="grid gap-1 text-sm font-bold text-muted">
                Type
                <input className="rounded-app border border-line px-3 py-2 text-ink" value={weight.interaction_type} readOnly />
              </label>
              {(["base_points", "points_per_minute", "points_per_message", "cap_per_event", "initiative_bonus", "returned_call_bonus"] as const).map((field) => (
                <label key={field} className="grid gap-1 text-sm font-bold text-muted">
                  {field.replaceAll("_", " ")}
                  <input className="rounded-app border border-line px-3 py-2 text-ink" name={field} type="number" step="0.25" defaultValue={weight[field] ?? ""} />
                </label>
              ))}
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 pb-3 text-sm font-bold">
                  <input type="checkbox" name="active" defaultChecked={weight.active} />
                  Active
                </label>
                <button className="rounded-app bg-ink px-4 py-3 font-black text-white">Save</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
