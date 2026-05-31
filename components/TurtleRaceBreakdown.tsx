import type { PersonYearlyBreakdown } from "@/lib/data";
import { favorScore } from "@/lib/display-score";
import type { Person } from "@/lib/types";

type Lane = {
  label: string;
  score: number;
  detail: string;
  color: string;
};

function Racer({ person, left }: { person: Person; left: number }) {
  return (
    <div className="absolute top-1/2 flex -translate-y-1/2 items-center" style={{ left: `${left}%` }}>
      <div className="h-3 w-4 rounded-l-full bg-mint" />
      <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-sm">
        {person.avatar_url ? (
          <img src={person.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-black text-clay">{person.name.slice(0, 1)}</span>
        )}
      </div>
      <div className="h-2 w-3 rounded-r-full bg-mint" />
    </div>
  );
}

export function TurtleRaceBreakdown({ person, breakdown }: { person: Person; breakdown?: PersonYearlyBreakdown }) {
  if (!breakdown) return null;

  const lanes: Lane[] = [
    {
      label: "Overall",
      score: breakdown.totalScore,
      detail: "Full emotional damage index",
      color: "bg-ink"
    },
    {
      label: "Calls",
      score: breakdown.callScore,
      detail: `${breakdown.callCount} calls logged`,
      color: "bg-blue"
    },
    {
      label: "Texts",
      score: breakdown.textScore,
      detail: `${breakdown.messageCount} messages counted`,
      color: "bg-clay"
    },
    {
      label: "Quality time",
      score: breakdown.timeTogetherScore,
      detail: `${Math.round(breakdown.qualityTimeMinutes)} minutes approved`,
      color: "bg-gold"
    }
  ];
  const maxScore = Math.max(...lanes.map((lane) => lane.score), 1);

  return (
    <section className="rounded-app border border-line bg-white p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-clay">Turtle race analytics</p>
          <h3 className="text-xl font-black">{breakdown.year} performance crawl</h3>
        </div>
        <p className="text-sm font-semibold text-muted">Fastest lane wins absolutely nothing. Which feels correct.</p>
      </div>
      <div className="mt-5 grid gap-4">
        {lanes.map((lane) => {
          const normalizedScore = favorScore(lane.score, maxScore);
          const progress = Math.max(4, normalizedScore);
          const racerLeft = Math.max(0, Math.min(88, progress - 8));

          return (
            <div key={lane.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-black">{lane.label}</p>
                  <p className="font-semibold text-muted">{lane.detail}</p>
                </div>
                <p className="font-black">{normalizedScore}/100</p>
              </div>
              <div className="relative h-14 rounded-app border border-line bg-paper">
                <div className="absolute left-3 right-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white" />
                <div className={`absolute left-3 top-1/2 h-2 -translate-y-1/2 rounded-full ${lane.color}`} style={{ width: `calc(${progress}% - 24px)` }} />
                <Racer person={person} left={racerLeft} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
