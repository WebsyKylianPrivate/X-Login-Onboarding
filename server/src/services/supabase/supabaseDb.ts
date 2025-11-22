// server/src/services/supabaseDb.ts
import { Pool } from "pg";

const {
  SUPABASE_DB_HOST,
  SUPABASE_DB_PORT,
  SUPABASE_DB_NAME,
  SUPABASE_DB_USER,
  SUPABASE_DB_PASSWORD,
  SUPABASE_DB_SSL,
} = process.env;

export const supabasePool =
  SUPABASE_DB_HOST && SUPABASE_DB_USER && SUPABASE_DB_PASSWORD
    ? new Pool({
      host: SUPABASE_DB_HOST,
      port: Number(SUPABASE_DB_PORT ?? 5432),
      database: SUPABASE_DB_NAME ?? "postgres",
      user: SUPABASE_DB_USER,
      password: SUPABASE_DB_PASSWORD,
      ssl:
        SUPABASE_DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    })
    : null;

export async function testDbConnection() {
  if (!supabasePool) return null;
  const res = await supabasePool.query("select now()");
  return res.rows[0];
}

export const connectSupabaseDb = async () => {
  try {
    if (!supabasePool) {
      console.log("⚠️  Supabase DB: Not configured (optional - missing SUPABASE_DB_* env variables)");
      return null;
    }
    console.log("🔌 Supabase DB connecting...");
    const res = await supabasePool.query("SELECT NOW()");
    console.log("✅ Supabase DB connected and ready");
    return supabasePool;
  } catch (error: any) {
    console.error("❌ Supabase DB connection error:", error.message);
    throw error;
  }
};

export const disconnectSupabaseDb = async () => {
  try {
    if (supabasePool) {
      await supabasePool.end();
      console.log("🔌 Supabase DB disconnected");
    }
  } catch (error) {
    console.error("Failed to disconnect from Supabase DB:", error);
  }
};
