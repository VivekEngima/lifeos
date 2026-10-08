import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "" || dbUrl.includes("YOUR_PASSWORD")) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: "No DATABASE_URL configured in .env.local. Running in local high-fidelity resilience mode.",
      dbUrlMasked: null,
    });
  }

  const masked = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const drizzleDb = getDb();
    if (!drizzleDb) {
      return NextResponse.json({
        configured: true,
        connected: false,
        message: "Failed to create database connection pool.",
        dbUrlMasked: masked,
      });
    }

    // Quick test query: count books or check habits
    const testBooks = await drizzleDb.select().from(schema.books).limit(1);

    return NextResponse.json({
      configured: true,
      connected: true,
      message: "Successfully connected to Supabase PostgreSQL via Drizzle ORM!",
      dbUrlMasked: masked,
      sampleCheck: {
        booksFound: testBooks.length,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      configured: true,
      connected: false,
      message: `Database connection error: ${err.message || String(error)}`,
      dbUrlMasked: masked,
    });
  }
}
