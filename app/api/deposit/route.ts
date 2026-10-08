import { NextRequest, NextResponse } from "next/server";
import { addPuneContribution } from "@/lib/lifeos-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, note } = body;
    const res = await addPuneContribution(Number(amount), note);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/deposit:", error);
    return NextResponse.json({ error: "Failed to record deposit" }, { status: 500 });
  }
}
