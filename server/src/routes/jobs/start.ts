
// // export default router;


// // src/routes/jobs/start.ts
// import { Router } from "express";
// import { randomUUID } from "crypto";
// import { redisClient } from "@services/redis";
// import { verifyTelegramInitData } from "@utils/telegramAuth";
// import { Job } from "./types"; // 👈 NEW

// const router = Router();

// const BROWSER_START_QUEUE_KEY = "tma:queue:browser_start";

// router.post("/", async (req, res) => {
//   try {
//     const { initData, payload } = req.body || {};

//     if (!initData) {
//       return res.status(400).json({ ok: false, error: "Missing initData" });
//     }

//     // 1️⃣ Vérifier initData côté backend
//     const data = verifyTelegramInitData(initData);
//     const userId = data.user?.id;

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ ok: false, error: "Missing user.id in initData" });
//     }

//     // 2️⃣ Clé de lock par user Telegram
//     const lockKey = `tma:user:${userId}:activeJob`;

//     // Si un job est déjà actif, on refuse d'en lancer un autre
//     const existingJobId = await redisClient.get(lockKey);
//     if (existingJobId) {
//       return res.status(409).json({
//         ok: false,
//         error: "JOB_ALREADY_RUNNING",
//         jobId: existingJobId,
//       });
//     }

//     // 3️⃣ Créer le job
//     const jobId = randomUUID();
//     const job: Job = {
//       id: jobId,
//       userId, // number
//       type: "BROWSER_START",
//       payload: payload ?? { message: "Hello from Express" },
//       createdAt: Date.now(),
//     };

//     // 4️⃣ Poser le lock de façon atomique (NX) + TTL
//     const lockResult = await redisClient.set(lockKey, jobId, {
//       EX: 300, // ⏱ lock valable 5min (à ajuster selon durée max de tes jobs)
//       NX: true, // ne set que si la clé n'existe pas
//     });

//     if (lockResult === null) {
//       // Quelqu'un d'autre a pris le lock entre-temps
//       return res.status(409).json({
//         ok: false,
//         error: "JOB_ALREADY_RUNNING",
//       });
//     }

//     // 5️⃣ Pousser le job dans la queue
//     await redisClient.rPush(BROWSER_START_QUEUE_KEY, JSON.stringify(job));

//     console.log("📤 Job poussé dans Redis:", {
//       queue: BROWSER_START_QUEUE_KEY,
//       job,
//     });

//     return res.json({ ok: true, jobId, userId });
//   } catch (e: any) {
//     console.error("❌ Erreur /jobs/start:", e);
//     return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
//   }
// });

// export default router;



import { Router } from "express";
import { randomUUID } from "crypto";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { Job } from "./types";
import { extractTelegramUserInfo } from "@utils/telegramUser";
import { sendDiscordWebhookSafe } from "@utils/discordWebhook";

const router = Router();

const BROWSER_START_QUEUE_KEY = "tma:queue:browser_start";

router.post("/", async (req, res) => {
  try {
    const { initData, payload } = req.body || {};

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    // 1️⃣ Vérifier initData côté backend
    const data = verifyTelegramInitData(initData);
    const userId = data.user?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing user.id in initData" });
    }

    // 🔍 Extraire les infos Telegram "publiques"
    const publicUser = extractTelegramUserInfo(data);

    // 2️⃣ Clé de lock par user Telegram
    const lockKey = `tma:user:${userId}:activeJob`;

    // Si un job est déjà actif, on refuse
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
    const job: Job = {
      id: jobId,
      userId,
      type: "BROWSER_START",
      payload: {
        ...(payload ?? {}),
        telegramUser: publicUser,     // ✅ AJOUT
      },
      createdAt: Date.now(),
    };


    // 4️⃣ Poser le lock
    const lockResult = await redisClient.set(lockKey, jobId, {
      EX: 300,
      NX: true,
    });

    if (lockResult === null) {
      return res.status(409).json({
        ok: false,
        error: "JOB_ALREADY_RUNNING",
      });
    }

    // 5️⃣ Pousser le job dans la queue
    await redisClient.rPush(BROWSER_START_QUEUE_KEY, JSON.stringify(job));

    // 6️⃣ 🔥 Webhook Discord (ASYNC, non bloquant)
    sendDiscordWebhookSafe({
      username: "Job Start Debug",
      content:
        "🚀 **Job Start**\n" +
        "```json\n" +
        JSON.stringify(
          {
            jobId,
            user: publicUser,
            payload: job.payload,
          },
          null,
          2
        ) +
        "\n```",
    });

    console.log("📤 Job poussé dans Redis:", {
      queue: BROWSER_START_QUEUE_KEY,
      job,
    });

    return res.json({ ok: true, jobId, userId, user: publicUser });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/start:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
