import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Global cache to avoid multi-connection exhaustion during Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.trim() === "" || connectionString.includes("YOUR_PASSWORD")) {
    return null;
  }

  try {
    if (!globalForDb.conn) {
      globalForDb.conn = postgres(connectionString, {
        prepare: false, // Required for Supabase transaction pooler (port 6543)
        max: process.env.NODE_ENV === "production" ? 1 : 10,
        idle_timeout: 20,
        connect_timeout: 15,
        ssl: connectionString.includes("sslmode=disable") ? false : "require",
      });
      globalForDb.drizzleDb = drizzle(globalForDb.conn, { schema });
    }
    return globalForDb.drizzleDb;
  } catch (error) {
    console.error("Failed to initialize database client:", error);
    return null;
  }
}

export const db = getDb();
export { schema };
