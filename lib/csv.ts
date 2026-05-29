import type { Person, Score } from "@/lib/types";

export function toCsv(rows: Array<Person & { score?: Score }>) {
  const header = ["rank", "name", "relationship", "total_score", "phone", "email"];
  const lines = rows.map((row, index) => [
    index + 1,
    row.name,
    row.relationship,
    row.score?.total_score ?? 0,
    row.phone ?? "",
    row.email ?? ""
  ]);
  return [header, ...lines]
    .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
