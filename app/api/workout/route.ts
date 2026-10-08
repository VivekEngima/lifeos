import { NextRequest, NextResponse } from "next/server";
import { logWorkout, updateWorkout, deleteWorkout } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await logWorkout(body);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/workout:", error);
    return NextResponse.json({ error: "Failed to log workout" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const res = await updateWorkout(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/workout:", error);
    return NextResponse.json({ error: "Failed to update workout" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteWorkout(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/workout:", error);
    return NextResponse.json({ error: "Failed to delete workout" }, { status: 500 });
  }
}
