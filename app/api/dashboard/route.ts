import { NextRequest, NextResponse } from "next/server";
import { getDashboardState } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getLocalTodayStr();
    const data = await getDashboardState(date);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in GET /api/dashboard:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard state", details: err?.message || String(error) },
      { status: 500 }
    );
  }
}
