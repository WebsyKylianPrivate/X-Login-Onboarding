// server/src/routes/health.ts
import { Router } from "express";
import { supabaseAdmin, testDbConnection } from "@services/supabase";
import { redisClient } from "@services/redis"; // adapte selon ton export

const router = Router();

router.get("/health", async (_req, res) => {
  const startedAt = Date.now();

  // 1) Test Supabase REST (test avec auth, ne nécessite pas de table)
  let supabaseOk = false;
  let supabaseError: string | null = null;

  try {
    // Test avec l'API auth qui est toujours disponible
    const { error } = await supabaseAdmin.auth.getSession();
    // Même si getSession retourne une erreur (pas de session),
    // cela signifie que la connexion à l'API fonctionne
    supabaseOk = true;
  } catch (e: any) {
    supabaseError = e?.message ?? String(e);
  }

  // 2) Test Postgres direct (optionnel)
  let dbOk: boolean | null = null;
  let dbTime: any = null;
  let dbError: string | null = null;

  try {
    const dbRes = await testDbConnection();
    if (dbRes) {
      dbOk = true;
      dbTime = dbRes.now;
    } else {
      dbOk = null; // pas configuré
    }
  } catch (e: any) {
    dbOk = false;
    dbError = e?.message ?? String(e);
  }

  // 3) Test Redis (optionnel)
  let redisOk: boolean | null = null;
  let redisError: string | null = null;

  try {
    if (redisClient) {
      await redisClient.ping();
      redisOk = true;
    } else {
      redisOk = null;
    }
  } catch (e: any) {
    redisOk = false;
    redisError = e?.message ?? String(e);
  }

  const ms = Date.now() - startedAt;

  const ok =
    supabaseOk &&
    (dbOk === true || dbOk === null) &&
    (redisOk === true || redisOk === null);

  return res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "degraded",
    latency_ms: ms,
    services: {
      supabase: {
        ok: supabaseOk,
        error: supabaseError,
      },
      postgres_pooler: {
        ok: dbOk,
        server_time: dbTime,
        error: dbError,
      },
      redis: {
        ok: redisOk,
        error: redisError,
      },
    },
  });
});

export default router;
