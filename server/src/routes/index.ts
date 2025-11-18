// src/routes/index.ts
import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth"; // on va le créer juste après

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

    // Pour l'instant tu log seulement
    return res.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Telegram auth failed:", err.message || err);
    return res.status(401).json({ ok: false, error: "Invalid initData" });
  }
});

export default router;
