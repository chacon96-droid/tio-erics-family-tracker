import Link from "next/link";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
import { emptyLeaderboardCopy, trendLore } from "@/lib/family-lore";
import type { PersonWithScore } from "@/lib/types";

export function LeaderboardTable({
  rows,
  linkPeople = true,
  canRemovePeople = false
}: {
  rows: PersonWithScore[];
  linkPeople?: boolean;
  canRemovePeople?: boolean;
}) {
  const maxScore = Math.max(...rows.map((row) => row.score?.total_score || 0), 1);

  if (!rows.length) {
    return (
      <EmptyState
        title="No approved family activity yet. Tragic, honestly."
        body={emptyLeaderboardCopy("leaderboard-empty")}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-app border border-white/10 bg-ink/45 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.06] text-xs uppercase tracking-[0.16em] text-champagne/60">
          <tr>
            <th className="p-3">Rank</th>
            <th className="p-3">Name</th>
            <th className="p-3">Score</th>
            <th className="p-3">Trend</th>
            <th className="p-3">Top category</th>
            {canRemovePeople ? <th className="p-3 text-right">Admin</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b border-white/10 transition last:border-b-0 hover:bg-white/[0.04]">
              <td className="p-3 align-middle font-serif text-2xl font-black text-gold">{index + 1}</td>
              <td className="p-3">
                {linkPeople ? (
                  <Link href={`/people/${row.id}`} className="font-black text-ivory underline-offset-4 hover:text-gold hover:underline">
                    {row.name}
                  </Link>
                ) : (
                  <span className="font-black text-ivory">{row.name}</span>
                )}
                <p className="text-xs font-semibold text-champagne/60">{row.relationship}</p>
              </td>
              <td className="p-3">
                <div className="font-black text-ivory">{row.score?.total_score || 0}</div>
                <div className="mt-1 h-2 w-32 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-mint via-gold to-blue"
                    style={{ width: `${Math.max(2, ((row.score?.total_score || 0) / maxScore) * 100)}%` }}
                  />
                </div>
              </td>
              <td className="p-3 font-bold text-champagne/85">
                {trendLore(row, row.score) ||
                  row.trendLabel ||
                  (row.trend === "up" ? "Climbing" : row.trend === "down" ? "Slipping" : "Quietly coasting")}
              </td>
              <td className="p-3 font-semibold text-champagne/60">{row.topCategory}</td>
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
