// // src/routes/jobs/status.ts
// import { Router } from "express";
// import { redisClient } from "@services/redis";
// import { verifyTelegramInitData } from "@utils/telegramAuth";

// const router = Router();

// const RESULT_PREFIX = "tma:result:browser_start:";

// router.post("/", async (req, res) => {
//   try {
//     const { initData } = req.body || {};

//     if (!initData) {
//       return res.status(400).json({ ok: false, error: "Missing initData" });
//     }

//     const data = verifyTelegramInitData(initData);
//     const userId = data.user?.id;

//     if (!userId) {
//       return res
//         .status(400)
//         .json({ ok: false, error: "Missing user.id in initData" });
//     }

//     const lockKey = `tma:user:${userId}:activeJob`;
//     const resultKey = `${RESULT_PREFIX}${userId}`;

//     const [lockJobId, rawResult] = await redisClient.mGet([lockKey, resultKey]);

//     let status: "idle" | "running" | "done" = "idle";
//     let jobId: string | null = null;
//     let result: any = null;

//     // 1️⃣ Job en cours (lock)
//     if (lockJobId) {
//       jobId = lockJobId as string;
//     }

//     // 2️⃣ Dernier résultat connu
//     if (rawResult) {
//       try {
//         const parsed = JSON.parse(rawResult as string);

//         // 🔑 Ne prendre ce résultat que s'il correspond au job courant
//         // ou s'il n'y a (plus) de job courant
//         if (!jobId || parsed.jobId === jobId) {
//           result = parsed;
//         }
//       } catch (err) {
//         console.error("❌ JSON invalide dans resultKey:", resultKey, rawResult);
//       }
//     }

//     if (jobId && !result) {
//       // 🔥 Il y a un job locké mais pas (encore) de résultat
//       status = "running";
//     } else if (result) {
//       status = (result.status as "done") || "done";
//       jobId = result.jobId ?? jobId;
//     } else {
//       status = "idle";
//     }

//     return res.json({
//       ok: true,
//       status,
//       jobId,
//       result,
//     });
//   } catch (e: any) {
//     console.error("❌ Erreur /jobs/status:", e);
//     return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
//   }
// });

// export default router;


// src/routes/jobs/status.ts
import { Router } from "express";
import { redisClient } from "@services/redis";
import { verifyTelegramInitData } from "@utils/telegramAuth";

const router = Router();

const RESULT_PREFIX = "tma:result:browser_start:";
const COMMAND_STATE_KEY = (userId: number | string) =>
  `tma:session:${userId}:commandState`;

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

    // 🔁 On récupère:
    //  - lockJobId  → job en cours (lock user)
    //  - rawResult  → dernier résultat de job
    //  - rawCommandState → dernier état de commande
    const [lockJobId, rawResult, rawCommandState] = await redisClient.mGet([
      lockKey,
      resultKey,
      commandStateKey,
    ]);

    let status: "idle" | "running" | "done" = "idle";
    let jobId: string | null = null;
    let result: any = null;
    let commandState: any = null;

    // ==========================
    // 🧠 Étape 1 : état commande
    // ==========================
    if (rawCommandState) {
      try {
        commandState = JSON.parse(rawCommandState as string);
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
        const parsed = JSON.parse(rawResult as string);

        // 🔑 On ne prend ce résultat que:
        //   - s'il correspond au job courant
        //   - ou s'il n'y a plus de job courant (lock expiré)
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

    // ==========================
    // 📦 Réponse
    // ==========================
    return res.json({
      ok: true,
      status,       // état de la session (job)
      jobId,        // id du job actuel ou dernier
      result,       // résultat du job (si terminé)
      commandState, // état de la dernière commande (idle/null, running, done, error)
    });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/status:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

export default router;
