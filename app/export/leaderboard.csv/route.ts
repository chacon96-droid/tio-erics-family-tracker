import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getLeaderboard } from "@/lib/data";
import { toCsv } from "@/lib/csv";

export async function GET() {
  await requireAdmin();
  const rows = await getLeaderboard("all_time");
  return new NextResponse(toCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=eric-family-tracker-leaderboard.csv"
    }
  });
}
