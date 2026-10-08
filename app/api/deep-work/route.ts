import { NextRequest, NextResponse } from "next/server";
import { logDeepWork, updateDeepWork, deleteDeepWork } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await logDeepWork(body);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/deep-work:", error);
    return NextResponse.json({ error: "Failed to log deep work" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const res = await updateDeepWork(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/deep-work:", error);
    return NextResponse.json({ error: "Failed to update deep work" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteDeepWork(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/deep-work:", error);
    return NextResponse.json({ error: "Failed to delete deep work" }, { status: 500 });
  }
}
