import { NextRequest, NextResponse } from "next/server";
import { addCustomGoal, updateCustomGoal, deleteCustomGoal } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await addCustomGoal({
      title: body.title,
      category: body.category || "skill",
      targetValue: Number(body.targetValue || 100),
      currentValue: Number(body.currentValue || 0),
      unit: body.unit || "%",
      targetDate: body.targetDate,
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/custom-goals:", error);
    return NextResponse.json({ error: "Failed to create custom goal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Goal id is required" }, { status: 400 });
    const res = await updateCustomGoal(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/custom-goals:", error);
    return NextResponse.json({ error: "Failed to update custom goal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Goal id is required" }, { status: 400 });
    const res = await deleteCustomGoal(id);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in DELETE /api/custom-goals:", error);
    return NextResponse.json({ error: "Failed to delete custom goal" }, { status: 500 });
  }
}
