import { NextRequest, NextResponse } from "next/server";
import { addPuneContribution, updatePuneGoal } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, note } = body;
    const res = await addPuneContribution(Number(amount), note);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/pune-fund:", error);
    return NextResponse.json({ error: "Failed to record deposit" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { target } = body;
    if (!target) return NextResponse.json({ error: "target is required" }, { status: 400 });
    const res = await updatePuneGoal(Number(target));
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/pune-fund:", error);
    return NextResponse.json({ error: "Failed to update fund goal" }, { status: 500 });
  }
}
