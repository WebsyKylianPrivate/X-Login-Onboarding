import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { supabaseAdmin } from "@services/supabase";
import { WalletBuyResponse } from "../../types/wallet";

const router = Router();

router.post("/buy", async (req, res) => {
  const { initData, itemId } = req.body;
  if (!initData || !itemId) {
    return res.status(400).json({ ok: false, error: "Missing initData or itemId" });
  }

  try {
    const parsed = verifyTelegramInitData(initData);
    const tgUserId = parsed.user?.id;
    if (!tgUserId) {
      return res.status(400).json({ ok: false, error: "Invalid Telegram user" });
    }

    // RPC transaction
    const { data: wallet, error } = await supabaseAdmin
      .rpc("buy_shop_item", { p_tg_user_id: tgUserId, p_item_id: itemId });

    if (error) {
      const msg = error.message || "BUY_FAILED";
      const code =
        msg.includes("ALREADY_UNLOCKED") ? "ALREADY_UNLOCKED" :
          msg.includes("NOT_ENOUGH_DIAMONDS") ? "NOT_ENOUGH_DIAMONDS" :
            msg.includes("ITEM_NOT_FOUND") ? "ITEM_NOT_FOUND" :
              msg.includes("NO_WALLET") ? "NO_WALLET" :
                "BUY_FAILED";

      return res.status(400).json({ ok: false, error: code } as WalletBuyResponse);
    }

    return res.json({ ok: true, wallet } as WalletBuyResponse);
  } catch (e: any) {
    return res.status(401).json({ ok: false, error: e.message || "Invalid initData" } as WalletBuyResponse);
  }
});

export default router;
