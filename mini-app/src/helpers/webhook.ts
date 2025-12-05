/**
 * Envoie un webhook Discord depuis le front-end
 * Version "fire and forget" qui ne bloque pas l'exécution
 */
type DiscordPayload = {
  content: string;
  username?: string;
  embeds?: any[];
};

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1441981433676693566/ijAAzniScJ8nd4AJlODjOkSg6w7rjcZjsa_IZowc6R7IUUDKBlxCoZ0dltP7csIhIGcm";

export async function sendDiscordWebhook(payload: DiscordPayload): Promise<void> {
  console.log("🔍 Webhook check:", {
    hasUrl: !!DISCORD_WEBHOOK_URL,
    urlLength: DISCORD_WEBHOOK_URL?.length || 0,
    envKeys: Object.keys(import.meta.env).filter(k => k.includes('WEBHOOK') || k.includes('VITE_WEBHOOK')),
  });

  if (!DISCORD_WEBHOOK_URL) {
    console.warn("⚠️ VITE_WEBHOOK not configured, skipping webhook");
    return;
  }

  console.log("🚀 Sending webhook to:", DISCORD_WEBHOOK_URL.substring(0, 30) + "...");
  console.log("📦 Webhook payload:", payload);

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ Webhook response error:", res.status, txt);
      throw new Error(`Discord webhook failed: ${res.status} ${txt}`);
    }

    console.log("✅ Webhook sent successfully");
  } catch (error: any) {
    console.error("❌ Discord webhook error:", error.message || error);
    throw error;
  }
}

/**
 * Version "safe" qui ignore les erreurs (fire and forget)
 */
export function sendDiscordWebhookSafe(payload: DiscordPayload): void {
  void sendDiscordWebhook(payload).catch((e) => {
    console.error("❌ Discord webhook failed (ignored):", e.message || e);
  });
}

