import { inheritanceDisclaimer } from "@/lib/family-lore";
import type { PersonWithScore } from "@/lib/types";

export function InheritanceSimulator({ rows, tone = "dark" }: { rows: PersonWithScore[]; tone?: "dark" | "light" }) {
  const total = rows.reduce((sum, row) => sum + (row.score?.total_score || 0), 0);
  const visibleRows = rows.slice(0, 8);

  return (
    <section
      className={`relative overflow-hidden rounded-app border border-gold/25 p-5 ${
        tone === "light" ? "bg-white/85" : "bg-gradient-to-br from-gold/15 via-white/[0.06] to-ink"
      }`}
    >
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Non-binding favoritism math</p>
      <h2 className={`mt-1 font-serif text-3xl font-black ${tone === "light" ? "text-ink" : "text-ivory"}`}>Projected Inheritance Simulator</h2>
      <div className="mt-4 grid gap-3">
        {!visibleRows.length ? (
          <p className={`text-sm font-semibold ${tone === "light" ? "text-muted" : "text-champagne/70"}`}>
            No shares to calculate yet. The estate remains emotionally unclaimed.
          </p>
        ) : null}
        {visibleRows.map((row) => {
          const share = total > 0 ? ((row.score?.total_score || 0) / total) * 100 : 0;
          return (
            <div key={row.id}>
              <div className={`flex justify-between gap-4 text-sm font-bold ${tone === "light" ? "text-ink" : "text-ivory"}`}>
                <span>{row.name}</span>
                <span className="text-gold">{share.toFixed(1)}%</span>
              </div>
              <div className={`mt-1 h-2 rounded-full ${tone === "light" ? "bg-line" : "bg-white/10"}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-mint" style={{ width: `${Math.max(2, share)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className={`mt-4 text-xs font-semibold ${tone === "light" ? "text-muted" : "text-champagne/60"}`}>
        {inheritanceDisclaimer(visibleRows.map((row) => row.id).join(""))}
      </p>
      </div>
    </section>
  );
}
