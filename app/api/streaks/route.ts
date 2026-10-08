import { NextResponse } from "next/server";
import { getStreaksAndConsistencyTelemetry } from "@/lib/lifeos-service";

export async function GET() {
  try {
    const data = await getStreaksAndConsistencyTelemetry();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/streaks:", error);
    return NextResponse.json({ error: "Failed to fetch streaks data" }, { status: 500 });
  }
}
