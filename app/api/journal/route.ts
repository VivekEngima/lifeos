import { NextRequest, NextResponse } from "next/server";
import { logJournal, updateJournalEntry, deleteJournalEntry } from "@/lib/lifeos-service";
import { getLocalTodayStr } from "@/lib/date-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, category, content } = body;
    const res = await logJournal({
      entryDate: date || getLocalTodayStr(),
      category,
      content: typeof content === "object" ? JSON.stringify(content) : String(content),
    });
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/journal:", error);
    return NextResponse.json({ error: "Failed to save journal entry" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const contentStr = typeof content === "object" ? JSON.stringify(content) : String(content);
    const res = await updateJournalEntry(id, contentStr);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/journal:", error);
    return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteJournalEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/journal:", error);
    return NextResponse.json({ error: "Failed to delete journal entry" }, { status: 500 });
  }
}
