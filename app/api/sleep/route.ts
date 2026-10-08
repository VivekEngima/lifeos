import { NextRequest, NextResponse } from "next/server";
import { logSleep, updateSleep, deleteSleep } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await logSleep(body);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/sleep:", error);
    return NextResponse.json({ error: "Failed to log sleep" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const res = await updateSleep(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/sleep:", error);
    return NextResponse.json({ error: "Failed to update sleep" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteSleep(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/sleep:", error);
    return NextResponse.json({ error: "Failed to delete sleep" }, { status: 500 });
  }
}
