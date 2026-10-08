import { NextRequest, NextResponse } from "next/server";
import { toggleHabitLog } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habitId, date, isCompleted } = body;
    const res = await toggleHabitLog(habitId, date || getLocalTodayStr(), isCompleted);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/habits:", error);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const { deleteHabit } = await import("@/lib/lifeos-service");
    await deleteHabit(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/habits:", error);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
