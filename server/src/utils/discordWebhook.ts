// src/utils/discordWebhook.ts
import fetch from "node-fetch";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL as string;

type DiscordPayload = {
  content: string;
  username?: string;
  embeds?: any[];
};

export async function sendDiscordWebhook(payload: DiscordPayload) {
  if (!DISCORD_WEBHOOK_URL) return;

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Discord webhook failed: ${res.status} ${txt}`);
  }
}

// ✅ version safe "fire and forget"
export function sendDiscordWebhookSafe(payload: DiscordPayload) {
  void sendDiscordWebhook(payload).catch((e) => {
    console.error("❌ Discord webhook failed (ignored):", e.message || e);
  });
}
