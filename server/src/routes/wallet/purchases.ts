import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { supabaseAdmin } from "@services/supabase";

const router = Router();

router.post("/purchases", async (req, res) => {
  const { initData, shopId } = req.body;
  if (!initData || !shopId) return res.status(400).json({ ok: false, error: "Missing args" });

  try {
    const parsed = verifyTelegramInitData(initData);
    const tgUserId = parsed.user?.id;
    if (!tgUserId) return res.status(400).json({ ok: false, error: "Invalid Telegram user" });

    const { data, error } = await supabaseAdmin
      .from("tg_purchases")
      .select("item_id")
      .eq("tg_user_id", tgUserId)
      .eq("shop_id", shopId);

    if (error) return res.status(500).json({ ok: false, error: "DB_READ_ERROR" });

    const unlockedIds = (data ?? []).map(r => r.item_id);
    return res.json({ ok: true, unlockedIds });
  } catch (e: any) {
    return res.status(401).json({ ok: false, error: e.message });
  }
});

export default router;
