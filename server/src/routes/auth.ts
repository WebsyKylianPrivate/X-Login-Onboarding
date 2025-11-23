

// src/routes/auth.ts
import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { supabaseAdmin } from "@services/supabase"; // ✅ ton client existant

const router = Router();

router.post("/telegram-init", async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ ok: false, error: "Missing initData" });
  }

  try {
    const data = verifyTelegramInitData(initData);

    const userId = data.user?.id || null;
    const chatInstance =
      data.chat_instance ||
      data.chat?.id?.toString() ||
      null;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        error: "Missing user.id in initData",
      });
    }

    // -----------------------------
    // 🔍 Lookup DB : est-ce que ce TG user a déjà un x_user lié ?
    // -----------------------------
    const { data: xUser, error } = await supabaseAdmin
      .from("x_users")                 // ✅ avec supabase-js la méthode c'est from()
      .select("username, created_at, avatar_url")
      .eq("tg_user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase read error:", error.message);
      return res.status(500).json({
        ok: false,
        error: "DB_READ_FAILED",
      });
    }

    // -----------------------------
    // ✅ réponse finale
    // -----------------------------
    return res.json({
      ok: true,
      userId,
      chatInstance,
      dbUser: xUser
        ? {
          isAuthenticated: true,
          username: xUser.username,
          createdAt: xUser.created_at,
          avatarUrl: xUser.avatar_url || null,
        }
        : {
          isAuthenticated: false,
          username: null,
          createdAt: null,
          avatarUrl: null,
        },
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