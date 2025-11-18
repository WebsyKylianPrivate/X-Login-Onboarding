// src/routes/index.ts
import { Router } from "express";
import { randomUUID } from "crypto";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { redisClient } from "@services/redis";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

router.post("/auth/telegram-init", (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: "Missing initData" });
  }

  try {
    const data = verifyTelegramInitData(initData);

    // Ici tu as un user Telegram authentifié
    console.log("🔐 Telegram auth OK");
    console.log("👤 User:", data.user);
    console.log("💬 Chat:", data.chat);
    console.log("📅 Auth date:", data.auth_date);

    // Retourner l'ID de l'utilisateur
    return res.json({
      ok: true,
      userId: data.user?.id || null
    });
  } catch (err: any) {
    console.error("❌ Telegram auth failed:", err.message || err);
    return res.status(401).json({
      ok: false,
      error: err.message || "Invalid initData"
    });
  }
});


//
// 🆕 Nouvelle route: push un job dans Redis
//

router.post("/jobs/test", async (req, res) => {
  try {
    const { payload } = req.body || {};
    const job = {
      id: randomUUID(),
      type: "TEST_PRINT",
      payload: payload ?? { message: "Hello from Express" },
      createdAt: Date.now(),
    };

    // 🔁 Nouvelle clé Redis pour la queue
    const QUEUE_KEY = "tma:queue:test_print";

    await redisClient.rPush(QUEUE_KEY, JSON.stringify(job));

    console.log("📤 Job poussé dans Redis:", { queue: QUEUE_KEY, job });

    return res.json({ ok: true, job });
  } catch (e: any) {
    console.error("❌ Erreur /jobs/test:", e);
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});


export default router;
