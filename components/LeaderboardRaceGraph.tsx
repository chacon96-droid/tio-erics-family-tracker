import { favorScore, maxTotalScore } from "@/lib/display-score";
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

  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const visibleRows = rows.slice(0, 10);
  const rawMaxScore = maxTotalScore(visibleRows);
  const maxScore = 100;
  const chartWidth = 900;
  const chartHeight = 360;
  const padding = { top: 34, right: 34, bottom: 70, left: 76 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const yTicks = [100, 75, 50, 25, 0];
  const points = visibleRows.map((row, index) => {
    const score = favorScore(row.score?.total_score, rawMaxScore);
    const x = padding.left + (visibleRows.length === 1 ? plotWidth / 2 : (index / (visibleRows.length - 1)) * plotWidth);
    const y = padding.top + plotHeight - (score / maxScore) * plotHeight;
    return { row, index, score, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <section className="min-w-0 max-w-full rounded-app border border-white/10 bg-white/[0.07] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Evidence chart, emotionally speaking</p>
          <h4 className="font-serif text-3xl font-black tracking-tight text-ivory">{title}</h4>
        </div>
        <p className="max-w-md text-sm font-semibold text-champagne/65">X axis is rank. Y axis is Favor Score. The math is petty, but official-looking.</p>
      </div>

      <div className="mt-5 max-w-full overflow-x-auto rounded-app border border-white/10 bg-ink/55 shadow-insetGold">
        <div className="w-full min-w-[540px] p-2 sm:min-w-[760px] sm:p-3">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${title} score by rank line graph`} className="h-auto w-full">
            <defs>
              <linearGradient id={`${chartId}-rankLine`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#6fb8a4" />
                <stop offset="52%" stopColor="#c7a45a" />
                <stop offset="100%" stopColor="#526f91" />
              </linearGradient>
              <filter id={`${chartId}-pointShadow`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000000" floodOpacity="0.35" />
              </filter>
              {points.map(({ row, x, y }) => (
                <clipPath key={row.id} id={`${chartId}-avatarClip-${row.id}`}>
                  <circle cx={x} cy={y} r="22" />
                </clipPath>
              ))}
            </defs>

            <rect x="0" y="0" width={chartWidth} height={chartHeight} rx="10" fill="#101413" />

            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxScore) * plotHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} stroke="#ffffff22" strokeDasharray="5 7" />
                  <text x={padding.left - 14} y={y + 4} textAnchor="end" className="fill-champagne text-[13px] font-bold opacity-70">
                    {tick}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#e8dcc9" strokeWidth="2.5" />
            <line
              x1={padding.left}
              x2={padding.left + plotWidth}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight}
              stroke="#e8dcc9"
              strokeWidth="2.5"
            />
            <text x="20" y={padding.top + 18} className="fill-gold text-[13px] font-black uppercase tracking-[0.14em]">
              Score
            </text>
            <text x={chartWidth - 95} y={chartHeight - 18} className="fill-gold text-[13px] font-black uppercase tracking-[0.14em]">
              Rank
            </text>

            {points.length > 1 ? <path d={linePath} fill="none" stroke={`url(#${chartId}-rankLine)`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}

            {points.map(({ row, index, score, x, y }) => (
              <g key={row.id} filter={`url(#${chartId}-pointShadow)`}>
                <line x1={x} x2={x} y1={padding.top + plotHeight} y2={y} stroke="#c7a45a" strokeDasharray="4 7" strokeOpacity="0.85" />
                <circle cx={x} cy={y} r="28" fill="#101413" stroke="#c7a45a" strokeWidth="4" />
                {row.avatar_url ? (
                  <image href={row.avatar_url} x={x - 22} y={y - 22} width="44" height="44" clipPath={`url(#${chartId}-avatarClip-${row.id})`} />
                ) : (
                  <text x={x} y={y + 7} textAnchor="middle" className="fill-gold text-[22px] font-black">
                    {row.name.slice(0, 1)}
                  </text>
                )}
                <text x={x} y={padding.top + plotHeight + 28} textAnchor="middle" className="fill-ivory text-[13px] font-black">
                  #{index + 1}
                </text>
                <text x={x} y={padding.top + plotHeight + 47} textAnchor="middle" className="fill-champagne text-[12px] font-bold opacity-70">
                  {row.name.length > 12 ? `${row.name.slice(0, 11)}...` : row.name}
                </text>
                <text x={x} y={Math.max(18, y - 38)} textAnchor="middle" className="fill-ivory text-[12px] font-black">
                  {score}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {points.slice(0, 4).map(({ row, index, score }) => (
          <div key={row.id} className="flex items-center gap-3 rounded-app border border-white/10 bg-white/[0.06] p-2">
            <RacerAvatar row={row} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ivory">
                #{index + 1} {row.name}
              </p>
              <p className="text-xs font-bold text-champagne/60">{score}/100 Favor Score</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
