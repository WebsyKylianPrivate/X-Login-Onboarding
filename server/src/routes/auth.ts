// src/routes/auth.ts
import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";

const router = Router();

router.post("/telegram-init", async (req, res) => {
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
    console.log("💠 chat_instance:", data.chat_instance);

    const userId = data.user?.id || null;
    const chatInstance =
      data.chat_instance ||
      data.chat?.id?.toString() ||
      null;

    return res.json({
      ok: true,
      userId,
      chatInstance,
    });
  } catch (err: any) {
    console.error("❌ Telegram auth failed:", err.message || err);
    return res.status(401).json({
      ok: false,
      error: err.message || "Invalid initData",
    });
  }
});

export default router;
