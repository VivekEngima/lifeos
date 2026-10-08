import { NextRequest, NextResponse } from "next/server";
import { logBrahmacharya } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, isClean, urgesCount, notes } = body;
    const res = await logBrahmacharya(
      date || getLocalTodayStr(),
      Boolean(isClean),
      Number(urgesCount || 0),
      notes
    );
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/brahmacharya:", error);
    return NextResponse.json({ error: "Failed to update brahmacharya log" }, { status: 500 });
  }
}
