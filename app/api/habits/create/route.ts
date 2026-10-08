import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const drizzleDb = getDb();
    if (!drizzleDb) throw new Error("Database not connected");

    const newHabit = await drizzleDb
      .insert(schema.habits)
      .values({
        title: title.trim(),
        description: description?.trim() || "",
        isActive: true,
      })
      .returning();

    return NextResponse.json({ success: true, habit: newHabit[0] });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
