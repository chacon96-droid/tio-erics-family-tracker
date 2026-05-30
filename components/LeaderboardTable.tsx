import Link from "next/link";
import { DeletePersonButton } from "@/components/DeletePersonButton";
import { EmptyState } from "@/components/EmptyState";
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
        body="The leaderboard is ready. The family, apparently, is pacing itself."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-app border border-line bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-line bg-paper">
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
            <tr key={row.id} className="border-b border-line last:border-b-0">
              <td className="p-3 font-black">{index + 1}</td>
              <td className="p-3">
                {linkPeople ? (
                  <Link href={`/people/${row.id}`} className="font-black text-ink underline-offset-4 hover:underline">
                    {row.name}
                  </Link>
                ) : (
                  <span className="font-black text-ink">{row.name}</span>
                )}
                <p className="text-xs font-semibold text-muted">{row.relationship}</p>
              </td>
              <td className="p-3">
                <div className="font-black">{row.score?.total_score || 0}</div>
                <div className="mt-1 h-2 w-32 rounded-full bg-paper">
                  <div
                    className="h-full rounded-full bg-clay"
                    style={{ width: `${Math.max(2, ((row.score?.total_score || 0) / maxScore) * 100)}%` }}
                  />
                </div>
              </td>
              <td className="p-3 font-bold">
                {row.trendLabel ||
                  (row.trend === "up" ? "Climbing" : row.trend === "down" ? "Slipping" : "Quietly coasting")}
              </td>
              <td className="p-3 font-semibold text-muted">{row.topCategory}</td>
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
