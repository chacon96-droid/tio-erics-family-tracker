import type { PersonWithScore } from "@/lib/types";

export function InheritanceSimulator({ rows }: { rows: PersonWithScore[] }) {
  const total = rows.reduce((sum, row) => sum + (row.score?.total_score || 0), 0);

  return (
    <section className="rounded-app border border-line bg-white p-4">
      <p className="text-xs font-black uppercase text-clay">Non-binding joke mode</p>
      <h2 className="mt-1 text-xl font-black">Projected Inheritance Simulator</h2>
      <div className="mt-4 grid gap-3">
        {rows.slice(0, 8).map((row) => {
          const share = total > 0 ? ((row.score?.total_score || 0) / total) * 100 : 0;
          return (
            <div key={row.id}>
              <div className="flex justify-between gap-4 text-sm font-bold">
                <span>{row.name}</span>
                <span>{share.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-paper">
                <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(2, share)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">
        This is a family bit, not a legal or financial instruction.
      </p>
    </section>
  );
}
