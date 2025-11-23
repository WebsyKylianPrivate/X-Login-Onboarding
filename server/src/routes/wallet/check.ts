// src/routes/wallet.ts
import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { supabaseAdmin } from "@services/supabase";
import { WalletCheckResponse } from "../../types/wallet";

const router = Router();

/**
 * POST /api/wallet/check
 * Body: { initData: string }
 *
 * Vérifie l'utilisateur Telegram et renvoie son wallet réel.
 */
router.post("/check", async (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({
      ok: false,
      error: "Missing initData",
    } as WalletCheckResponse);
  }

  try {
    // 1) Vérification Telegram (HMAC)
    const parsed = verifyTelegramInitData(initData);
    const tgUserId = parsed.user?.id;

    if (!tgUserId) {
      return res.status(400).json({
        ok: false,
        error: "Invalid Telegram user",
      } as WalletCheckResponse);
    }

    // 2) Lire le wallet Supabase
    const { data: wallet, error } = await supabaseAdmin
      .from("tg_wallets")
      .select("*")
      .eq("tg_user_id", tgUserId)
      .maybeSingle();

    if (error) {
      console.error("Supabase wallet error:", error);
      return res.status(500).json({
        ok: false,
        error: "DB_READ_ERROR",
      } as WalletCheckResponse);
    }

    // 3) Si pas encore de wallet (should not happen car Python l'initialise)
    if (!wallet) {
      return res.json({
        ok: true,
        wallet: null,
      } as WalletCheckResponse);
    }

    // 4) Réponse OK
    return res.json({
      ok: true,
      wallet,
    } as WalletCheckResponse);
  } catch (err: any) {
    console.error("Wallet check error:", err.message);
    return res.status(401).json({
      ok: false,
      error: err.message || "Invalid initData",
    } as WalletCheckResponse);
  }
});

export default router;
