// scripts/gen-mock-init-data.mjs
import crypto from "crypto";
import { URLSearchParams } from "url";
import "dotenv/config"; // lit .env

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN manquant dans .env");
  process.exit(1);
}

// 🔐 Même algo que Telegram
function signInitData(fields) {
  const entries = Object.entries(fields)
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => a.localeCompare(b));

  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return { ...fields, hash };
}

// 👤 Génère un initData pour un user donné
function buildInitDataForUser(user) {
  const nowSec = Math.floor(Date.now() / 1000);

  const fields = {
    auth_date: nowSec.toString(),
    chat_instance: "-2066714543580557301",
    chat_type: "sender",
    user: JSON.stringify(user),
  };

  const signed = signInitData(fields);
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(signed)) {
    params.set(k, v);
  }

  return params.toString(); // initData final
}

// 6 users factices
const mockUsers = [
  {
    id: 1000000001,
    first_name: "Mock",
    last_name: "User1",
    username: "mock_user1",
    language_code: "fr",
    is_premium: true,
  },
  {
    id: 1000000002,
    first_name: "Mock",
    last_name: "User2",
    username: "mock_user2",
    language_code: "fr",
    is_premium: false,
  },
  {
    id: 1000000003,
    first_name: "Mock",
    last_name: "User3",
    username: "mock_user3",
    language_code: "en",
    is_premium: false,
  },
  {
    id: 1000000004,
    first_name: "Mock",
    last_name: "User4",
    username: "mock_user4",
    language_code: "en",
    is_premium: true,
  },
  {
    id: 1000000005,
    first_name: "Mock",
    last_name: "User5",
    username: "mock_user5",
    language_code: "fr",
  },
  {
    id: 1000000006,
    first_name: "Mock",
    last_name: "User6",
    username: "mock_user6",
    language_code: "fr",
  },
];

console.log("🧪 6 initData générés en JSON :\n");

const results = mockUsers.map((user, idx) => {
  const initData = buildInitDataForUser(user);
  const obj = {
    userId: user.id,
    initData,
  };

  // log individuel propre
  console.log(JSON.stringify(obj, null, 2), "\n");

  return obj;
});

// 👉 log final : tableau JSON complet
console.log("\n📦 JSON complet (copiable pour un fichier mocks.json) :");
console.log(JSON.stringify(results, null, 2));
