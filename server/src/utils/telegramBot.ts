// src/utils/telegramBot.ts
import axios from "axios";

const BOT_TOKEN = process.env.TG_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn("⚠️ TG_BOT_TOKEN missing");
}

const TG_API = BOT_TOKEN
  ? `https://api.telegram.org/bot${BOT_TOKEN}`
  : null;

export async function sendTelegramPurchaseMessage(params: {
  chatId: number;
  photoUrl: string;
  itemName: string;
  price: number;
  diamondsLeft: number;
}) {
  if (!TG_API) return;

  const { chatId, photoUrl, itemName, price, diamondsLeft } = params;

  const caption =
    `🎉 *Purchase Complete!*\n\n` +
    `🖼 *Item:* ${itemName}\n` +
    `💎 *Price:* ${price} diamonds\n` +
    `💰 *Remaining Balance:* ${diamondsLeft} diamonds\n\n` +
    `Thanks for your purchase!`;
  try {
    // sendPhoto affiche directement l'image achetée
    await axios.post(`${TG_API}/sendPhoto`, {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "Markdown",
    });
  } catch (e: any) {
    // Si le user n'a jamais parlé au bot → erreur 403
    console.error("❌ sendTelegramPurchaseMessage failed:", e.response?.data || e.message);
  }
}
