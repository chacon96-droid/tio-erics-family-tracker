import type { PersonWithScore } from "@/lib/types";

function RacerAvatar({ row }: { row: PersonWithScore }) {
  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-gold bg-ink text-sm font-black text-gold shadow-brand">
      {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : row.name.slice(0, 1)}
    </div>
  );
}

export function LeaderboardRaceGraph({ rows, title = "The affection race" }: { rows: PersonWithScore[]; title?: string }) {
  if (!rows.length) return null;

  const visibleRows = rows.slice(0, 10);
  const maxScore = Math.max(...visibleRows.map((row) => row.score?.total_score || 0), 1);
  const chartWidth = 900;
  const chartHeight = 360;
  const padding = { top: 34, right: 34, bottom: 70, left: 76 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(maxScore * ratio));
  const points = visibleRows.map((row, index) => {
    const score = row.score?.total_score || 0;
    const x = padding.left + (visibleRows.length === 1 ? plotWidth / 2 : (index / (visibleRows.length - 1)) * plotWidth);
    const y = padding.top + plotHeight - (score / maxScore) * plotHeight;
    return { row, index, score, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <section className="mb-4 rounded-app border border-gold/40 bg-ivory p-4 shadow-brand">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">Evidence chart, emotionally speaking</p>
          <h4 className="font-serif text-2xl font-black tracking-tight">{title}</h4>
        </div>
        <p className="text-sm font-semibold text-muted">X axis is rank. Y axis is points. The math is petty, but official-looking.</p>
      </div>

      <div className="mt-5 overflow-x-auto rounded-app border border-line bg-paper shadow-insetGold">
        <div className="min-w-[760px] p-3">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${title} score by rank line graph`} className="h-auto w-full">
            <defs>
              <linearGradient id="rankLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#101413" />
                <stop offset="52%" stopColor="#c7a45a" />
                <stop offset="100%" stopColor="#9b6a3b" />
              </linearGradient>
              <filter id="pointShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#101413" floodOpacity="0.18" />
              </filter>
            </defs>

            <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="10" fill="#f3eee2" />

            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxScore) * plotHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#d9cfbd" strokeDasharray="5 7" />
                  <text x={padding.left - 14} y={y + 4} textAnchor="end" className="fill-muted text-[13px] font-bold">
                    {tick}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#101413" strokeWidth="2.5" />
            <line
              x1={padding.left}
              x2={padding.left + plotWidth}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight}
              stroke="#101413"
              strokeWidth="2.5"
            />
            <text x="20" y={padding.top + 18} className="fill-ink text-[13px] font-black uppercase tracking-[0.14em]">
              Points
            </text>
            <text x={chartWidth - 95} y={chartHeight - 18} className="fill-ink text-[13px] font-black uppercase tracking-[0.14em]">
              Rank
            </text>

            {points.length > 1 ? <path d={linePath} fill="none" stroke="url(#rankLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}

            {points.map(({ row, index, score, x, y }) => (
              <g key={row.id} filter="url(#pointShadow)">
                <clipPath id={`avatarClip-${row.id}`}>
                  <circle cx={x} cy={y} r="22" />
                </clipPath>
                <line x1={x} x2={x} y1={padding.top + plotHeight} y2={y} stroke="#c7a45a" strokeDasharray="4 7" strokeOpacity="0.85" />
                <circle cx={x} cy={y} r="28" fill="#101413" stroke="#c7a45a" strokeWidth="4" />
                {row.avatar_url ? (
                  <image href={row.avatar_url} x={x - 22} y={y - 22} width="44" height="44" clipPath={`url(#avatarClip-${row.id})`} />
                ) : (
                  <text x={x} y={y + 7} textAnchor="middle" className="fill-gold text-[22px] font-black">
                    {row.name.slice(0, 1)}
                  </text>
                )}
                <text x={x} y={padding.top + plotHeight + 28} textAnchor="middle" className="fill-ink text-[13px] font-black">
                  #{index + 1}
                </text>
                <text x={x} y={padding.top + plotHeight + 47} textAnchor="middle" className="fill-muted text-[12px] font-bold">
                  {row.name.length > 12 ? `${row.name.slice(0, 11)}...` : row.name}
                </text>
                <text x={x} y={Math.max(18, y - 38)} textAnchor="middle" className="fill-ink text-[12px] font-black">
                  {Math.round(score * 10) / 10}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {points.slice(0, 4).map(({ row, index, score }) => (
          <div key={row.id} className="flex items-center gap-3 rounded-app border border-line bg-white/80 p-2">
            <RacerAvatar row={row} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                #{index + 1} {row.name}
              </p>
              <p className="text-xs font-bold text-muted">{Math.round(score * 10) / 10} pts</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
