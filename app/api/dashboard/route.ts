import { NextRequest, NextResponse } from "next/server";
import { getDashboardState } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getLocalTodayStr();
    const data = await getDashboardState(date);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard state" }, { status: 500 });
  }
}
