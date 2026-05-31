import Link from "next/link";
import { FamilyShell } from "@/components/FamilyShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardRaceGraph } from "@/components/LeaderboardRaceGraph";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getFamilyLeaderboard, requireFamilyAccessPerson } from "@/lib/family-access";
import { periods } from "@/lib/periods";
import { leaderboardAudienceForRelationship } from "@/lib/relationships";
import type { ScorePeriod } from "@/lib/types";

export default async function FamilyLeaderboardPage({ searchParams }: { searchParams?: Promise<{ period?: ScorePeriod }> }) {
  const [person, params] = await Promise.all([requireFamilyAccessPerson(), searchParams]);
  const period = periods.some((item) => item.value === params?.period) ? params!.period! : "year";
  const audience = leaderboardAudienceForRelationship(person.relationship);
  const rows = await getFamilyLeaderboard(period, audience);
  const audienceCopy =
    audience === "friends"
      ? "Family friends get the friends-only leaderboard. Same judgment, different seating chart."
      : "Family gets the family-only leaderboard. Friends have their own lane, because boundaries are apparently healthy.";

  return (
    <FamilyShell person={person}>
      <div className="grid gap-6">
        <section>
          <p className="text-xs font-black uppercase text-clay">Evidence-based favoritism</p>
          <h2 className="text-3xl font-black">Leaderboard</h2>
          <p className="mt-2 max-w-2xl font-semibold text-muted">
            {audienceCopy} If you are losing, remember: denial is free, but calling Eric scores better.
          </p>
        </section>
        <nav className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/family/leaderboard?period=${item.value}`}
              className={`rounded-app border px-3 py-2 text-sm font-black ${
                item.value === period ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/[0.08] text-ivory hover:border-mint/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LeaderboardRaceGraph rows={rows} title={audience === "friends" ? "Friends Favorability Index" : "Family Totem Pole"} />
        <LeaderboardTable rows={rows} linkPeople={false} />
        <InheritanceSimulator rows={rows} />
      </div>
    </FamilyShell>
  );
}
