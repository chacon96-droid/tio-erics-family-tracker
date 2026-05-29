import { subDays, subMonths, subYears } from "date-fns";
import type { ScorePeriod } from "@/lib/types";

export const periods: Array<{ value: ScorePeriod; label: string }> = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
  { value: "all_time", label: "All-time" }
];

export function periodStart(period: ScorePeriod) {
  const now = new Date();
  if (period === "week") return subDays(now, 7).toISOString();
  if (period === "month") return subMonths(now, 1).toISOString();
  if (period === "year") return subYears(now, 1).toISOString();
  return null;
}
