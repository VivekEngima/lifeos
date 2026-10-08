import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function createPlannerTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "planner_tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "task_date" date NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "time_slot" text,
        "priority" text DEFAULT 'medium' NOT NULL,
        "category" text,
        "status" text DEFAULT 'pending' NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `;
    console.log("✓ planner_tasks table created");

    await sql`
      CREATE TABLE IF NOT EXISTS "planner_goals" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "scope" text NOT NULL,
        "period_start" date NOT NULL,
        "period_end" date NOT NULL,
        "target_value" integer DEFAULT 1 NOT NULL,
        "current_value" integer DEFAULT 0 NOT NULL,
        "unit" text,
        "status" text DEFAULT 'active' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `;
    console.log("✓ planner_goals table created");
    
    console.log("Done! Both planner tables are ready.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

createPlannerTables();
