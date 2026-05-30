import type { PersonWithScore } from "@/lib/types";

function RacerAvatar({ row }: { row: PersonWithScore }) {
  return (
    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper text-sm font-black text-clay shadow-sm">
      {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : row.name.slice(0, 1)}
    </div>
  );
}

export function LeaderboardRaceGraph({ rows, title = "The affection race" }: { rows: PersonWithScore[]; title?: string }) {
  if (!rows.length) return null;

  const visibleRows = rows.slice(0, 12);
  const maxScore = Math.max(...visibleRows.map((row) => row.score?.total_score || 0), 1);

  return (
    <section className="mb-4 rounded-app border border-line bg-white p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-clay">Photo finish, emotionally speaking</p>
          <h4 className="text-xl font-black">{title}</h4>
        </div>
        <p className="text-sm font-semibold text-muted">Profile photos move by score. Zero effort starts near the parking lot.</p>
      </div>

      <div className="mt-5 grid gap-3">
        {visibleRows.map((row, index) => {
          const score = row.score?.total_score || 0;
          const progress = Math.max(score > 0 ? 10 : 4, Math.min(100, (score / maxScore) * 100));
          const racerLeft = Math.max(0, Math.min(88, progress - 6));

          return (
            <div key={row.id} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-black">
                    #{index + 1} {row.name}
                  </p>
                  <p className="truncate font-semibold text-muted">{row.topCategory || "No approved activity. Devastating."}</p>
                </div>
                <p className="shrink-0 font-black">{Math.round(score * 10) / 10} pts</p>
              </div>
              <div className="relative h-16 overflow-hidden rounded-app border border-line bg-paper">
                <div className="absolute left-4 right-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white" />
                <div
                  className="absolute left-4 top-1/2 h-2 -translate-y-1/2 rounded-full bg-clay"
                  style={{ width: `calc(${progress}% - 32px)` }}
                />
                <div className="absolute top-1/2 flex -translate-y-1/2 items-center gap-2" style={{ left: `${racerLeft}%` }}>
                  <RacerAvatar row={row} />
                  <span className="hidden rounded-full border border-line bg-white px-2 py-1 text-xs font-black text-ink shadow-sm sm:inline">
                    {index === 0 ? "front-runner" : index === 1 ? "lurking" : index === 2 ? "within striking distance" : "needs a call"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
