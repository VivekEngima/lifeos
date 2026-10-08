import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { eq, and, gte, lte, asc } from "drizzle-orm";

// GET /api/planner/tasks?date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    const tasks = await db
      .select()
      .from(schema.plannerTasks)
      .where(eq(schema.plannerTasks.taskDate, date))
      .orderBy(asc(schema.plannerTasks.sortOrder), asc(schema.plannerTasks.timeSlot));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error in GET /api/planner/tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/planner/tasks
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const body = await req.json();
    const { taskDate, title, description, timeSlot, priority, category, status, sortOrder } = body;

    if (!taskDate || !title) {
      return NextResponse.json({ error: "taskDate and title are required" }, { status: 400 });
    }

    const [task] = await db
      .insert(schema.plannerTasks)
      .values({
        taskDate,
        title,
        description: description || null,
        timeSlot: timeSlot || null,
        priority: priority || "medium",
        category: category || null,
        status: status || "pending",
        sortOrder: sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error in POST /api/planner/tasks:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT /api/planner/tasks
export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.timeSlot !== undefined) updateData.timeSlot = updates.timeSlot;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.sortOrder !== undefined) updateData.sortOrder = updates.sortOrder;

    const [task] = await db
      .update(schema.plannerTasks)
      .set(updateData)
      .where(eq(schema.plannerTasks.id, id))
      .returning();

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error in PUT /api/planner/tasks:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/planner/tasks?id=...
export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await db.delete(schema.plannerTasks).where(eq(schema.plannerTasks.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/planner/tasks:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
