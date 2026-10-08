import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { eq, and, lte, gte } from "drizzle-orm";

// GET /api/planner/goals?scope=weekly|monthly&date=YYYY-MM-DD
// Returns goals whose period contains the given date
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // 'weekly' | 'monthly' | null (all)
    const date = searchParams.get("date");

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) {
      conditions.push(eq(schema.plannerGoals.scope, scope));
    }

    // If date is given, find goals whose period range includes that date
    if (date) {
      conditions.push(lte(schema.plannerGoals.periodStart, date));
      conditions.push(gte(schema.plannerGoals.periodEnd, date));
    }

    const goals =
      conditions.length > 0
        ? await db
            .select()
            .from(schema.plannerGoals)
            .where(and(...conditions))
        : await db.select().from(schema.plannerGoals);

    // Calculate progress percentage for each goal
    const goalsWithProgress = goals.map((g) => ({
      ...g,
      progressPct: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
    }));

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    console.error("Error in GET /api/planner/goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

// POST /api/planner/goals
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const body = await req.json();
    const { title, description, scope, periodStart, periodEnd, targetValue, unit } = body;

    if (!title || !scope || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "title, scope, periodStart, periodEnd are required" },
        { status: 400 }
      );
    }

    const [goal] = await db
      .insert(schema.plannerGoals)
      .values({
        title,
        description: description || null,
        scope,
        periodStart,
        periodEnd,
        targetValue: targetValue ?? 1,
        currentValue: 0,
        unit: unit || null,
        status: "active",
      })
      .returning();

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error in POST /api/planner/goals:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

// PUT /api/planner/goals
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
    if (updates.targetValue !== undefined) updateData.targetValue = updates.targetValue;
    if (updates.currentValue !== undefined) updateData.currentValue = updates.currentValue;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.status !== undefined) updateData.status = updates.status;
    updateData.updatedAt = new Date();

    const [goal] = await db
      .update(schema.plannerGoals)
      .set(updateData)
      .where(eq(schema.plannerGoals.id, id))
      .returning();

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error in PUT /api/planner/goals:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

// DELETE /api/planner/goals?id=...
export async function DELETE(req: NextRequest) {
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ error: "DB not connected" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await db.delete(schema.plannerGoals).where(eq(schema.plannerGoals.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/planner/goals:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
