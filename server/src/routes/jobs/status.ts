// src/routes/jobs/status.ts
import { Router } from "express";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { JobResult, CommandState } from "./types";
import type { WorkerJobStatus, SessionStatus } from "../../types/jobs";
// adapte le chemin si besoin

const router = Router();

const RESULT_PREFIX = "tma:result:browser_start:";
const COMMAND_STATE_KEY = (userId: number | string) =>
  `tma:session:${userId}:commandState`;

// ✅ Mapping WorkerJobStatus -> SessionStatus
const mapWorkerToSession = (s: WorkerJobStatus): SessionStatus => {
  if (s === "done" || s === "error" || s === "no_profile_available") return "done";
  return "idle";
};

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
    const commandStateKey = COMMAND_STATE_KEY(userId);

    const [lockJobId, rawResult, rawCommandState] = await redisClient.mGet([
      lockKey,
      resultKey,
      commandStateKey,
    ]);

    let status: SessionStatus = "idle";
    let jobId: string | null = null;
    let result: JobResult | null = null;
    let commandState: CommandState | null = null;

    // ==========================
    // 🧠 Étape 1 : état commande
    // ==========================
    if (rawCommandState) {
      try {
        commandState = JSON.parse(rawCommandState as string) as CommandState;
      } catch (e) {
        console.error("❌ Invalid JSON in commandState:", rawCommandState);
      }
    }

    // ==========================
    // 🧠 Étape 2 : état job
    // ==========================

    // 1️⃣ Job en cours (lock)
    if (lockJobId) {
      jobId = lockJobId as string;
    }

    // 2️⃣ Dernier résultat connu
    if (rawResult) {
      try {
        const parsed = JSON.parse(rawResult as string) as JobResult;

        if (!jobId || parsed.jobId === jobId) {
          result = parsed;
        }
      } catch (err) {
        console.error("❌ JSON invalide dans resultKey:", resultKey, rawResult);
      }
    }

    // ✅ Logique macro corrigée
    if (jobId && !result) {
      status = "running";
    } else if (result) {
      status = mapWorkerToSession(result.status as WorkerJobStatus);
      jobId = result.jobId ?? jobId;
    } else {
      status = "idle";
    }

    return res.json({
      ok: true,
      status,
      jobId,
      result,
      commandState,
    });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/status:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
