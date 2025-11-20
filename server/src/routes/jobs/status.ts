// src/routes/jobs/status.ts
import { Router } from "express";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";

const router = Router();

const RESULT_PREFIX = "tma:result:browser_start:";

router.post("/", async (req, res) => {
  try {
    const { initData } = req.body || {};

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    const data = verifyTelegramInitData(initData);
    const userId = data.user?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing user.id in initData" });
    }

    const lockKey = `tma:user:${userId}:activeJob`;
    const resultKey = `${RESULT_PREFIX}${userId}`;

    const [lockJobId, rawResult] = await redisClient.mGet([lockKey, resultKey]);

    let status: "idle" | "running" | "done" = "idle";
    let jobId: string | null = null;
    let result: any = null;

    // 1️⃣ Job en cours (lock)
    if (lockJobId) {
      jobId = lockJobId as string;
    }

    // 2️⃣ Dernier résultat connu
    if (rawResult) {
      try {
        const parsed = JSON.parse(rawResult as string);

        // 🔑 Ne prendre ce résultat que s'il correspond au job courant
        // ou s'il n'y a (plus) de job courant
        if (!jobId || parsed.jobId === jobId) {
          result = parsed;
        }
      } catch (err) {
        console.error("❌ JSON invalide dans resultKey:", resultKey, rawResult);
      }
    }

    if (jobId && !result) {
      // 🔥 Il y a un job locké mais pas (encore) de résultat
      status = "running";
    } else if (result) {
      status = (result.status as "done") || "done";
      jobId = result.jobId ?? jobId;
    } else {
      status = "idle";
    }

    return res.json({
      ok: true,
      status,
      jobId,
      result,
    });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/status:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
