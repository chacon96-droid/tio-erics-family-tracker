import type { PersonWithScore } from "@/lib/types";

export function rawTotalScore(row?: PersonWithScore) {
  return row?.score?.total_score || 0;
}

export function maxTotalScore(rows: PersonWithScore[]) {
  return Math.max(...rows.map(rawTotalScore), 1);
}

export function favorScore(score: number | undefined, maxScore: number) {
  if (!score || maxScore <= 0) return 0;
  return Math.round(Math.min(100, (score / maxScore) * 100));
}

export function favorScoreForRow(row: PersonWithScore, maxScore: number) {
  return favorScore(rawTotalScore(row), maxScore);
}

export function formatRawScore(score: number | undefined) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(score || 0);
}
