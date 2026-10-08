import { NextRequest, NextResponse } from "next/server";
import { updateDisciplineScore } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, score } = body;
    const res = await updateDisciplineScore(date || getLocalTodayStr(), Number(score));
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/discipline:", error);
    return NextResponse.json({ error: "Failed to update discipline score" }, { status: 500 });
  }
}
