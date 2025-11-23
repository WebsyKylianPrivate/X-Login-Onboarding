// // src/routes/wallet/buy.ts
// import { Router } from "express";
// import { verifyTelegramInitData } from "@utils/telegramAuth";
// import { supabaseAdmin } from "@services/supabase";
// import { WalletBuyResponse } from "../../types/wallet";

// const router = Router();

// router.post("/buy", async (req, res) => {
//   const { initData, itemId, shopId } = req.body;
//   if (!initData || !itemId || !shopId) {
//     return res.status(400).json({ ok: false, error: "Missing initData, itemId, or shopId" });
//   }

//   try {
//     const parsed = verifyTelegramInitData(initData);
//     const tgUserId = parsed.user?.id;
//     if (!tgUserId) {
//       return res.status(400).json({ ok: false, error: "Invalid Telegram user" });
//     }

//     // RPC transaction avec shopId
//     const { data: wallet, error } = await supabaseAdmin
//       .rpc("buy_shop_item", {
//         p_tg_user_id: tgUserId,
//         p_shop_id: shopId,
//         p_item_id: itemId
//       });

//     if (error) {
//       const msg = error.message || "BUY_FAILED";
//       const code =
//         msg.includes("ALREADY_UNLOCKED") ? "ALREADY_UNLOCKED" :
//           msg.includes("NOT_ENOUGH_DIAMONDS") ? "NOT_ENOUGH_DIAMONDS" :
//             msg.includes("ITEM_NOT_FOUND") ? "ITEM_NOT_FOUND" :
//               msg.includes("NO_WALLET") ? "NO_WALLET" :
//                 "BUY_FAILED";

//       return res.status(400).json({ ok: false, error: code } as WalletBuyResponse);
//     }

//     return res.json({ ok: true, wallet } as WalletBuyResponse);
//   } catch (e: any) {
//     return res.status(401).json({ ok: false, error: e.message || "Invalid initData" } as WalletBuyResponse);
//   }
// });

// export default router;


import { Router } from "express";
import { verifyTelegramInitData } from "@utils/telegramAuth";
import { supabaseAdmin } from "@services/supabase";
import { WalletBuyResponse } from "../../types/wallet";
import { sendTelegramPurchaseMessage } from "@utils/telegramBot"; // 👈 ton helper

const router = Router();

router.post("/buy", async (req, res) => {
  const { initData, itemId, shopId } = req.body;
  if (!initData || !itemId || !shopId) {
    return res.status(400).json({
      ok: false,
      error: "Missing initData, itemId, or shopId",
    } as WalletBuyResponse);
  }

  try {
    const parsed = verifyTelegramInitData(initData);
    const tgUserId = parsed.user?.id;

    if (!tgUserId) {
      return res.status(400).json({
        ok: false,
        error: "Invalid Telegram user",
      } as WalletBuyResponse);
    }

    // 1) RPC buy atomique
    const { data: wallet, error } = await supabaseAdmin.rpc("buy_shop_item", {
      p_tg_user_id: tgUserId,
      p_shop_id: shopId,
      p_item_id: itemId,
    });

    if (error) {
      const msg = error.message || "BUY_FAILED";
      const code =
        msg.includes("ALREADY_UNLOCKED") ? "ALREADY_UNLOCKED" :
          msg.includes("NOT_ENOUGH_DIAMONDS") ? "NOT_ENOUGH_DIAMONDS" :
            msg.includes("ITEM_NOT_FOUND") ? "ITEM_NOT_FOUND" :
              msg.includes("NO_WALLET") ? "NO_WALLET" :
                "BUY_FAILED";

      return res.status(400).json({
        ok: false,
        error: code,
      } as WalletBuyResponse);
    }

    // 2) Lire l'item acheté (pour nom + photo)
    const { data: item, error: itemErr } = await supabaseAdmin
      .from("shop_items")
      .select("name, image_url, price")
      .eq("id", itemId)
      .maybeSingle();

    if (!itemErr && item) {
      // 3) Envoi Telegram fire-and-forget
      sendTelegramPurchaseMessage({
        chatId: tgUserId, // en privé => tgUserId fonctionne comme chat_id
        photoUrl: item.image_url,
        itemName: item.name,
        price: item.price,
        diamondsLeft: wallet.diamonds,
      });
    } else {
      console.warn("⚠️ Item not found for Telegram message:", itemErr?.message);
    }

    // 4) Réponse API normale
    return res.json({
      ok: true,
      wallet,
    } as WalletBuyResponse);

  } catch (e: any) {
    return res.status(401).json({
      ok: false,
      error: e.message || "Invalid initData",
    } as WalletBuyResponse);
  }
});

export default router;
