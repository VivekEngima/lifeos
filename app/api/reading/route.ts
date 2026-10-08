import { NextRequest, NextResponse } from "next/server";
import { getAllReadings, logReading, updateReading, deleteReading } from "@/lib/lifeos-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId") || undefined;
    const readings = await getAllReadings(bookId);
    return NextResponse.json(readings);
  } catch (error) {
    console.error("Error in GET /api/reading:", error);
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await logReading(body);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in POST /api/reading:", error);
    return NextResponse.json({ error: "Failed to log reading" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const res = await updateReading(id, data);
    return NextResponse.json(res);
  } catch (error) {
    console.error("Error in PUT /api/reading:", error);
    return NextResponse.json({ error: "Failed to update reading" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteReading(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/reading:", error);
    return NextResponse.json({ error: "Failed to delete reading" }, { status: 500 });
  }
}
