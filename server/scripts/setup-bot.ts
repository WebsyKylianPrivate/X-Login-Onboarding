// scripts/setup-bot.ts
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, "../.env") });

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://acepot.app";

async function setupWebhook() {
  if (!BOT_TOKEN) {
    console.error("❌ TG_BOT_TOKEN non défini dans .env");
    process.exit(1);
  }

  console.log("🔧 Configuration du webhook Telegram...");
  console.log(`📍 URL du webhook: ${WEBHOOK_URL}/api/bot/webhook`);

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
    const response = await axios.post(url, {
      url: `${WEBHOOK_URL}/api/bot/webhook`,
      allowed_updates: ["message", "chat_member"], // Activer les mises à jour chat_member pour détecter les nouveaux membres
    });

    if (response.data.ok) {
      console.log("✅ Webhook configuré avec succès !");
      console.log(`📋 Description: ${response.data.description || "N/A"}`);
    } else {
      console.error("❌ Erreur lors de la configuration du webhook:", response.data);
    }
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
    if (error.response) {
      console.error("📋 Détails:", error.response.data);
    }
    process.exit(1);
  }
}

async function getBotInfo() {
  if (!BOT_TOKEN) {
    console.error("❌ TG_BOT_TOKEN non défini");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    const response = await axios.get(url);

    if (response.data.ok) {
      const bot = response.data.result;
      console.log("\n🤖 Informations du bot:");
      console.log(`   Nom: ${bot.first_name}${bot.username ? ` (@${bot.username})` : ""}`);
      console.log(`   ID: ${bot.id}`);
      console.log(`   Peut rejoindre des groupes: ${bot.can_join_groups ? "Oui" : "Non"}`);
      console.log(`   Peut lire les messages de groupe: ${bot.can_read_all_group_messages ? "Oui" : "Non"}`);
    }
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des infos:", error.message);
  }
}

async function main() {
  await getBotInfo();
  await setupWebhook();
}

main();

