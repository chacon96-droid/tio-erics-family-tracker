import Link from "next/link";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
import { favorScoreForRow, maxTotalScore, rawTotalScore } from "@/lib/display-score";
import { emptyLeaderboardCopy, trendLore } from "@/lib/family-lore";
import type { PersonWithScore } from "@/lib/types";

export function LeaderboardTable({
  rows,
  linkPeople = true,
  canRemovePeople = false,
  tone = "dark"
}: {
  rows: PersonWithScore[];
  linkPeople?: boolean;
  canRemovePeople?: boolean;
  tone?: "dark" | "light";
}) {
  const maxScore = maxTotalScore(rows);

  if (!rows.length) {
    return (
      <EmptyState
        title="No approved family activity yet. Tragic, honestly."
        body={emptyLeaderboardCopy("leaderboard-empty")}
      />
    );
  }

  return (
    <div
      className={`max-w-full overflow-x-auto rounded-app border shadow-[0_24px_70px_rgba(0,0,0,0.12)] ${
        tone === "light" ? "border-line bg-white/85" : "border-white/10 bg-ink/45"
      }`}
    >
      <table className="min-w-[720px] w-full border-collapse text-left text-sm">
        <thead
          className={`border-b text-xs uppercase tracking-[0.16em] ${
            tone === "light" ? "border-line bg-paper/70 text-clay" : "border-white/10 bg-white/[0.06] text-champagne/60"
          }`}
        >
          <tr>
            <th className="p-3">Rank</th>
            <th className="p-3">Name</th>
            <th className="p-3">Favor score</th>
            <th className="p-3">Trend</th>
            <th className="p-3">Top category</th>
            {canRemovePeople ? <th className="p-3 text-right">Admin</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={`border-b transition last:border-b-0 ${tone === "light" ? "border-line hover:bg-paper/70" : "border-white/10 hover:bg-white/[0.04]"}`}
            >
              <td className="p-3 align-middle font-serif text-2xl font-black text-gold">{index + 1}</td>
              <td className="p-3">
                {linkPeople ? (
                  <Link href={`/people/${row.id}`} className={`font-black underline-offset-4 hover:text-gold hover:underline ${tone === "light" ? "text-ink" : "text-ivory"}`}>
                    {row.name}
                  </Link>
                ) : (
                  <span className={`font-black ${tone === "light" ? "text-ink" : "text-ivory"}`}>{row.name}</span>
                )}
                <p className={`text-xs font-semibold ${tone === "light" ? "text-muted" : "text-champagne/60"}`}>{row.relationship}</p>
              </td>
              <td className="p-3">
                <div className={`font-black ${tone === "light" ? "text-ink" : "text-ivory"}`}>{favorScoreForRow(row, maxScore)}</div>
                <div className={`mt-1 h-2 w-32 rounded-full ${tone === "light" ? "bg-line" : "bg-white/10"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-mint via-gold to-blue"
                    style={{ width: `${Math.max(2, (rawTotalScore(row) / maxScore) * 100)}%` }}
                  />
                </div>
              </td>
              <td className={`p-3 font-bold ${tone === "light" ? "text-muted" : "text-champagne/85"}`}>
                {trendLore(row, row.score) ||
                  row.trendLabel ||
                  (row.trend === "up" ? "Climbing" : row.trend === "down" ? "Slipping" : "Quietly coasting")}
              </td>
              <td className={`p-3 font-semibold ${tone === "light" ? "text-muted" : "text-champagne/60"}`}>{row.topCategory}</td>
              {canRemovePeople ? (
                <td className="p-3 text-right">
                  <DeletePersonButton personId={row.id} personName={row.name} variant="inline" returnTo="/leaderboard" />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
