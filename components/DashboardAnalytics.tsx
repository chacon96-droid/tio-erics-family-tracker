import { favorScore, maxTotalScore, rawTotalScore } from "@/lib/display-score";
import type { Interaction, Person, PersonWithScore } from "@/lib/types";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function monthLabel(month: number) {
  return new Date(2026, month, 1).toLocaleString("en-US", { month: "short" });
}

function personInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

function Sparkline({ values }: { values: number[] }) {
  const width = 720;
  const height = 190;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - 24 - (value / max) * (height - 46);
    return { x, y, value };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tracked activity by month" className="h-auto w-full">
      <defs>
        <linearGradient id="activityLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#6fb8a4" />
          <stop offset="50%" stopColor="#c7a45a" />
          <stop offset="100%" stopColor="#526f91" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line key={tick} x1="0" x2={width} y1={height - 24 - tick * (height - 46)} y2={height - 24 - tick * (height - 46)} stroke="#ffffff22" />
      ))}
      <path d={path} fill="none" stroke="url(#activityLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="7" fill="#101413" stroke="#c7a45a" strokeWidth="3" />
          <text x={point.x} y={height - 4} textAnchor="middle" className="fill-champagne text-[12px] font-bold">
            {monthLabel(index)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CompositionBars({ rows }: { rows: PersonWithScore[] }) {
  const leaders = rows.slice(0, 5);
  const max = maxTotalScore(leaders);

  return (
    <div className="grid gap-3">
      {leaders.map((row, index) => {
        const score = row.score;
        const total = rawTotalScore(row);
        const call = total ? ((score?.call_score || 0) / total) * 100 : 0;
        const text = total ? ((score?.text_score || 0) / total) * 100 : 0;
        const time = total ? ((score?.time_together_score || 0) / total) * 100 : 0;
        const bonus = Math.max(0, 100 - call - text - time);
        const width = Math.max(3, (total / max) * 100);

        return (
          <div key={row.id} className="rounded-app border border-white/10 bg-white/[0.06] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-gold/70 bg-ink text-xs font-black text-gold">
                  {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : personInitial(row.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ivory">
                    #{index + 1} {row.name}
                  </p>
                  <p className="text-xs font-bold text-champagne/70">{row.topCategory}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-black text-gold">{favorScore(total, max)}</p>
            </div>
            <div className="mt-3 h-3 rounded-full bg-white/10" style={{ width: `${width}%` }}>
              <div className="flex h-full overflow-hidden rounded-full">
                <div className="bg-mint" style={{ width: `${call}%` }} />
                <div className="bg-blue" style={{ width: `${text}%` }} />
                <div className="bg-gold" style={{ width: `${time}%` }} />
                <div className="bg-clay" style={{ width: `${bonus}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardAnalytics({
  people,
  interactions,
  familyRows,
  friendRows
}: {
  people: Person[];
  interactions: Interaction[];
  familyRows: PersonWithScore[];
  friendRows: PersonWithScore[];
}) {
  const approved = interactions.filter((interaction) => interaction.status === "approved" && !interaction.is_group_chat);
  const calls = approved.filter((interaction) => ["call", "missed_call_returned"].includes(interaction.type));
  const texts = approved.filter((interaction) => interaction.type === "text_exchange");
  const qualityTime = approved.filter((interaction) => ["fortnite", "visit", "manual_activity"].includes(interaction.type));
  const totalMinutes = approved.reduce((sum, interaction) => sum + Number(interaction.duration_minutes || 0), 0);
  const totalMessages = approved.reduce((sum, interaction) => sum + Number(interaction.message_count || 0), 0);
  const monthly = Array.from({ length: 12 }, (_, month) =>
    approved.filter((interaction) => new Date(interaction.started_at).getFullYear() === 2026 && new Date(interaction.started_at).getMonth() === month).length
  );
  const combinedRows = [...familyRows, ...friendRows].sort((a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0));
  const leader = combinedRows[0];
  const second = combinedRows[1];
  const maxScore = maxTotalScore(combinedRows);
  const gap = favorScore(rawTotalScore(leader), maxScore) - favorScore(rawTotalScore(second), maxScore);
  const activePeople = people.filter((person) => person.active).length || 1;
  const contactCoverage = Math.round((combinedRows.filter((row) => (row.score?.total_score || 0) > 0).length / activePeople) * 100);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="relative overflow-hidden rounded-app border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-mint/15 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Signal over sentiment</p>
              <h3 className="mt-1 font-serif text-3xl font-black tracking-tight text-ivory">2026 contact velocity</h3>
            </div>
            <div className="rounded-app border border-gold/35 bg-gold/10 px-3 py-2 text-right">
              <p className="text-xs font-black uppercase text-gold">Coverage</p>
              <p className="text-2xl font-black text-ivory">{contactCoverage}%</p>
            </div>
          </div>
          <div className="mt-5">
            <Sparkline values={monthly} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-champagne/60">Calls</p>
              <p className="mt-1 text-2xl font-black text-ivory">{calls.length}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-champagne/60">Texts</p>
              <p className="mt-1 text-2xl font-black text-ivory">{texts.length}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-champagne/60">Minutes</p>
              <p className="mt-1 text-2xl font-black text-ivory">{formatNumber(totalMinutes)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-champagne/60">Messages</p>
              <p className="mt-1 text-2xl font-black text-ivory">{formatNumber(totalMessages)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-app border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Leaderboard market map</p>
        <h3 className="mt-1 font-serif text-3xl font-black tracking-tight text-ivory">Communication mix</h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black uppercase">
          <span className="rounded-full bg-mint/20 px-2 py-1 text-mint">Calls</span>
          <span className="rounded-full bg-blue/25 px-2 py-1 text-champagne">Texts</span>
          <span className="rounded-full bg-gold/20 px-2 py-1 text-gold">Time</span>
          <span className="rounded-full bg-clay/30 px-2 py-1 text-champagne">Other</span>
        </div>
        <div className="mt-4">
          <CompositionBars rows={combinedRows} />
        </div>
        <div className="mt-4 rounded-app border border-white/10 bg-ink/40 p-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-champagne/60">Current spread</p>
          <p className="mt-1 text-sm font-bold text-ivory">
            {leader?.name || "Nobody"} leads by {formatNumber(Math.max(0, gap))} Aura Index points. {qualityTime.length ? `${qualityTime.length} quality-time entries are on the board.` : "Quality time remains an allegation."}
          </p>
        </div>
      </div>
    </section>
  );
}
