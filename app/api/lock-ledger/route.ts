import { NextRequest, NextResponse } from "next/server";
import { lockDailyLedger } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date } = body;
    const res = await lockDailyLedger(date || getLocalTodayStr());
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/lock-ledger:", error);
    return NextResponse.json({ error: "Failed to lock ledger" }, { status: 500 });
  }
}
