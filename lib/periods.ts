import { subDays, subMonths } from "date-fns";
import type { ScorePeriod } from "@/lib/types";

export const periods: Array<{ value: ScorePeriod; label: string }> = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "2026 so far" },
  { value: "all_time", label: "All-time" }
];

export function periodStart(period: ScorePeriod) {
  const now = new Date();
  if (period === "week") return subDays(now, 7).toISOString();
  if (period === "month") return subMonths(now, 1).toISOString();
  if (period === "year") return new Date("2026-01-01T00:00:00.000Z").toISOString();
  return null;
}
