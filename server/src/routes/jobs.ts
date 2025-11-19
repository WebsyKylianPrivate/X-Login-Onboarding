// src/routes/jobs.ts
import { Router } from "express";
import { randomUUID } from "crypto";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";

const router = Router();

router.post("/test", async (req, res) => {
  try {
    const { initData, payload } = req.body || {};

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    // 1️⃣ Vérifier initData côté backend
    const data = verifyTelegramInitData(initData);
    const userId = data.user?.id;

    if (!userId) {
      return res.status(400).json({ ok: false, error: "Missing user.id in initData" });
    }

    // 2️⃣ Clé de lock par user Telegram
    const lockKey = `tma:user:${userId}:activeJob`;

    // Si un job est déjà actif, on refuse d'en lancer un autre
    const existingJobId = await redisClient.get(lockKey);
    if (existingJobId) {
      return res.status(409).json({
        ok: false,
        error: "JOB_ALREADY_RUNNING",
        jobId: existingJobId,
      });
    }

    // 3️⃣ Créer le job
    const jobId = randomUUID();
    const job = {
      id: jobId,
      userId,
      type: "TEST_PRINT",
      payload: payload ?? { message: "Hello from Express" },
      createdAt: Date.now(),
    };

    const QUEUE_KEY = "tma:queue:test_print";

    // 4️⃣ Poser le lock de façon atomique (NX) + TTL
    const lockResult = await redisClient.set(lockKey, jobId, {
      EX: 300, // ⏱ lock valable 1h (à ajuster selon durée max de tes jobs)
      NX: true, // ne set que si la clé n'existe pas
    });

    if (lockResult === null) {
      // Quelqu'un d'autre a pris le lock entre-temps
      return res.status(409).json({
        ok: false,
        error: "JOB_ALREADY_RUNNING",
      });
    }

    // 5️⃣ Pousser le job dans la queue
    await redisClient.rPush(QUEUE_KEY, JSON.stringify(job));

    console.log("📤 Job poussé dans Redis:", { queue: QUEUE_KEY, job });

    return res.json({ ok: true, jobId, userId });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/test:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
