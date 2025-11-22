// src/routes/bot.ts
import { Router } from "express";
import axios from "axios";
import { redisClient } from "@services/redis";

const router = Router();

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL || "https://acepot.app";
const BOT_USERNAME = process.env.BOT_USERNAME; // Nom d'utilisateur du bot (sans @)

if (!BOT_TOKEN) {
  console.warn("⚠️ TG_BOT_TOKEN non défini - le bot Telegram ne fonctionnera pas");
}

// Préfixe Redis pour stocker les liens d'invitation
const INVITE_LINK_PREFIX = "bot:invite:";
const INVITE_LINKS_SET = "bot:invite:links";

// Webhook pour recevoir les mises à jour du bot Telegram
router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    // Pas besoin de gérer chat_member car on utilise des deep links vers le bot

    // Gérer les messages texte
    if (update.message && update.message.text) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text.trim();
      const userId = message.from.id;

      // Gérer la commande /invite - créer un lien d'invitation
      if (text === "/invite" || text.startsWith("/invite")) {
        const response = await handleInviteCommand(chatId, userId);
        return res.status(200).json({ ok: true, sent: response });
      }

      // Gérer la commande /start avec ou sans paramètre
      if (text === "/start" || text.startsWith("/start")) {
        // Extraire le paramètre du /start (ex: /start invite_123456)
        const parts = text.split(" ");
        const inviteCode = parts.length > 1 ? parts[1] : null;
        
        if (inviteCode && inviteCode.startsWith("invite_")) {
          // Quelqu'un arrive via un lien d'invitation
          const response = await handleInviteStart(chatId, userId, inviteCode);
          return res.status(200).json({ ok: true, sent: response });
        } else {
          // Commande /start normale
          const response = await sendStartMessage(chatId);
          return res.status(200).json({ ok: true, sent: response });
        }
      }

      // Réponse par défaut pour les autres messages
      await sendDefaultMessage(chatId);
    }

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("❌ Erreur webhook bot:", error);
    res.status(200).json({ ok: true }); // Toujours répondre 200 à Telegram
  }
});

// Fonction pour envoyer le message /start avec un lien vers la mini app
async function sendStartMessage(chatId: number) {
  if (!BOT_TOKEN) {
    throw new Error("TG_BOT_TOKEN non défini");
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: chatId,
    text: `👋 Bienvenue !\n\n🚀 [Ouvrir l'application](${MINI_APP_URL})`,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  });

  return response.data;
}

// Fonction pour créer un lien d'invitation vers le bot (deep link)
async function handleInviteCommand(chatId: number, userId: number) {
  if (!BOT_TOKEN) {
    throw new Error("TG_BOT_TOKEN non défini");
  }

  if (!BOT_USERNAME) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: "❌ BOT_USERNAME non configuré. Veuillez configurer le nom d'utilisateur du bot dans les variables d'environnement.",
    });
    return response.data;
  }

  // Générer un code d'invitation unique
  const inviteCode = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Créer le deep link vers le bot
  const inviteLink = `https://t.me/${BOT_USERNAME}?start=${inviteCode}`;

  try {
    // Stocker le code d'invitation dans Redis avec expiration (24h)
    if (redisClient) {
      await redisClient.setEx(
        `${INVITE_LINK_PREFIX}${inviteCode}`,
        86400, // 24 heures
        JSON.stringify({
          inviteCode,
          createdBy: userId,
          createdAt: Date.now(),
          inviteLink,
          used: false,
        })
      );
      await redisClient.sAdd(INVITE_LINKS_SET, inviteCode);
    }

    // Envoyer le lien à l'utilisateur
    const sendUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(sendUrl, {
      chat_id: chatId,
      text: `🔗 Lien d'invitation créé !\n\n📋 Partagez ce lien. Quand quelqu'un clique dessus, il recevra un message "Trista vous a invité" et un bouton pour déverrouiller la mini app.\n\n🔗 ${inviteLink}\n\n⏰ Expire dans 24h.`,
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la création du lien:", error);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: `❌ Erreur lors de la création du lien: ${error.message}`,
    });
    return response.data;
  }
}

// Fonction pour gérer quand quelqu'un arrive via un lien d'invitation
async function handleInviteStart(chatId: number, userId: number, inviteCode: string) {
  if (!BOT_TOKEN) {
    throw new Error("TG_BOT_TOKEN non défini");
  }

  try {
    // Vérifier si le code d'invitation existe dans Redis
    let inviteData = null;
    if (redisClient) {
      const data = await redisClient.get(`${INVITE_LINK_PREFIX}${inviteCode}`);
      if (data) {
        inviteData = JSON.parse(data);
        
        // Vérifier si le lien a déjà été utilisé
        if (inviteData.used) {
          return await sendStartMessage(chatId);
        }
        
        // Marquer le lien comme utilisé
        inviteData.used = true;
        inviteData.usedBy = userId;
        inviteData.usedAt = Date.now();
        await redisClient.setEx(
          `${INVITE_LINK_PREFIX}${inviteCode}`,
          86400,
          JSON.stringify(inviteData)
        );
      }
    }

    // Envoyer le message "Trista vous a invité" avec le bouton déverrouiller
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: "🎉 Trista vous a invité !\n\nCliquez sur le bouton ci-dessous pour déverrouiller et accéder à l'application :",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔓 Déverrouiller",
              web_app: {
                url: MINI_APP_URL,
              },
            },
          ],
        ],
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur lors du traitement de l'invitation:", error);
    // En cas d'erreur, envoyer le message de start normal
    return await sendStartMessage(chatId);
  }
}

// Cette fonction n'est plus nécessaire car on utilise des deep links

// Cette fonction n'est plus nécessaire car on utilise handleInviteStart

// Fonction pour envoyer un message par défaut
async function sendDefaultMessage(chatId: number) {
  if (!BOT_TOKEN) {
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: chatId,
    text: `Utilisez la commande /start pour lancer l'application.\n\n🚀 [Ouvrir l'application](${MINI_APP_URL})`,
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  });
}

// Route pour définir le webhook (à appeler une fois pour configurer le bot)
router.post("/set-webhook", async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "TG_BOT_TOKEN non défini" });
    }

    const webhookUrl = req.body.url || process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(400).json({ error: "URL du webhook requise" });
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    const response = await axios.post(url, {
      url: `${webhookUrl}/api/bot/webhook`,
      allowed_updates: ["message", "chat_member"], // Activer les mises à jour chat_member
    });

    res.json({ ok: true, result: response.data });
  } catch (error: any) {
    console.error("❌ Erreur setWebhook:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour obtenir les infos du bot
router.get("/info", async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "TG_BOT_TOKEN non défini" });
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    const response = await axios.get(url);

    res.json({
      ok: true,
      bot: response.data.result,
      miniAppUrl: MINI_APP_URL,
      botUsername: BOT_USERNAME || "Non configuré",
    });
  } catch (error: any) {
    console.error("❌ Erreur getMe:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour générer un lien d'invitation vers le bot (API alternative)
router.post("/create-invite", async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "TG_BOT_TOKEN non défini" });
    }

    if (!BOT_USERNAME) {
      return res.status(400).json({ error: "BOT_USERNAME non configuré" });
    }

    const userId = req.body.userId || 0;
    const inviteCode = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const inviteLink = `https://t.me/${BOT_USERNAME}?start=${inviteCode}`;

    // Stocker dans Redis
    if (redisClient) {
      await redisClient.setEx(
        `${INVITE_LINK_PREFIX}${inviteCode}`,
        86400,
        JSON.stringify({
          inviteCode,
          createdBy: userId,
          createdAt: Date.now(),
          inviteLink,
          used: false,
        })
      );
      await redisClient.sAdd(INVITE_LINKS_SET, inviteCode);
    }

    res.json({
      ok: true,
      inviteLink,
      inviteCode,
      miniAppUrl: MINI_APP_URL,
    });
  } catch (error: any) {
    console.error("❌ Erreur createInvite:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

