import Link from "next/link";
import { FamilyShell } from "@/components/FamilyShell";
import { InheritanceSimulator } from "@/components/InheritanceSimulator";
import { LeaderboardRaceGraph } from "@/components/LeaderboardRaceGraph";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getFamilyLeaderboard, requireFamilyAccessPerson } from "@/lib/family-access";
import { periods } from "@/lib/periods";
import { leaderboardAudienceForRelationship, type LeaderboardAudience } from "@/lib/relationships";
import type { ScorePeriod } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FamilyLeaderboardPage({ searchParams }: { searchParams?: Promise<{ period?: ScorePeriod; audience?: LeaderboardAudience }> }) {
  const [person, params] = await Promise.all([requireFamilyAccessPerson(), searchParams]);
  const period = periods.some((item) => item.value === params?.period) ? params!.period! : "year";
  const defaultAudience = leaderboardAudienceForRelationship(person.relationship);
  const audience = params?.audience === "friends" || params?.audience === "family" ? params.audience : defaultAudience;
  const rows = await getFamilyLeaderboard(period, audience);
  const audienceCopy =
    audience === "friends"
      ? "Friends-only board. Same courtroom, different docket."
      : "Family-only board. Friends have their own tab, because boundaries are apparently healthy.";
  const audienceTabs: { label: string; value: "family" | "friends"; detail: string }[] = [
    { label: "Family", value: "family", detail: "Bloodline division" },
    { label: "Friends", value: "friends", detail: "Chosen chaos division" }
  ];

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
        <nav className="grid gap-2 sm:grid-cols-2">
          {audienceTabs.map((item) => (
            <Link
              key={item.value}
              href={`/family/leaderboard?period=${period}&audience=${item.value}`}
              className={`rounded-app border p-3 text-left transition ${
                item.value === audience ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/[0.08] text-ivory hover:border-mint/70"
              }`}
            >
              <span className="block text-sm font-black">{item.label}</span>
              <span className={`mt-1 block text-xs font-black uppercase tracking-[0.14em] ${item.value === audience ? "text-ink/70" : "text-champagne/55"}`}>
                {item.detail}
              </span>
            </Link>
          ))}
        </nav>
        <nav className="flex flex-wrap gap-2">
          {periods.map((item) => (
            <Link
              key={item.value}
              href={`/family/leaderboard?period=${item.value}&audience=${audience}`}
              className={`rounded-app border px-3 py-2 text-sm font-black ${
                item.value === period ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/[0.08] text-ivory hover:border-mint/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LeaderboardRaceGraph rows={rows} title={audience === "friends" ? "Eric's Friend Aura Index" : "Tio Eric Family Totem Pole"} />
        <LeaderboardTable rows={rows} linkPeople={false} />
        <InheritanceSimulator rows={rows} />
      </div>
    </FamilyShell>
  );
}
