import type { PersonYearlyBreakdown } from "@/lib/data";
import { favorScore } from "@/lib/display-score";
import type { Person } from "@/lib/types";

type Lane = {
  label: string;
  score: number;
  detail: string;
  color: string;
  normalized?: boolean;
};

function Racer({ person, left }: { person: Person; left: number }) {
  return (
    <div className="absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${left}%` }}>
      <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border-2 border-gold bg-ink shadow-sm">
        {person.avatar_url ? (
          <img src={person.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-black text-gold">{person.name.slice(0, 1)}</span>
        )}
      </div>
    </div>
  );
}

export function TurtleRaceBreakdown({ person, breakdown, auraIndex }: { person: Person; breakdown?: PersonYearlyBreakdown; auraIndex?: number }) {
  if (!breakdown) return null;

  const normalizedAuraIndex = Math.max(0, Math.min(100, Math.round(auraIndex ?? 0)));
  const lanes: Lane[] = [
    {
      label: "Overall",
      score: normalizedAuraIndex,
      detail: "Full emotional damage index",
      color: "bg-mint",
      normalized: true
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
      color: "bg-blue"
    },
    {
      label: "Quality time",
      score: breakdown.timeTogetherScore,
      detail: `${Math.round(breakdown.qualityTimeMinutes)} minutes tracked`,
      color: "bg-gold"
    }
  ];
  const maxScore = Math.max(...lanes.map((lane) => lane.score), 1);

  return (
    <section className="rounded-app border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-clay">Favorability lanes</p>
          <h3 className="text-xl font-black">{breakdown.year} aura report</h3>
        </div>
        <p className="text-sm font-semibold text-muted">A scientific look at who is aura maxxing and who needs to pick up the phone.</p>
      </div>
      <div className="mt-5 grid gap-4">
        {lanes.map((lane) => {
          const normalizedScore = lane.normalized ? lane.score : favorScore(lane.score, maxScore);
          const progress = Math.max(4, normalizedScore);
          const racerLeft = Math.max(6, Math.min(94, progress));

          return (
            <div key={lane.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-black">{lane.label}</p>
                  <p className="font-semibold text-muted">{lane.detail}</p>
                </div>
                <p className="font-black">{normalizedScore}/100</p>
              </div>
              <div className="relative h-14 overflow-hidden rounded-app border border-white/10 bg-ink/60">
                <div className="absolute left-3 right-3 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
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
