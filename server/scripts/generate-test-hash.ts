// scripts/generate-test-hash.ts
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, "../.env") });

const BOT_TOKEN = process.env.TG_BOT_TOKEN || "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

function generateTelegramHash(data: Record<string, string>): string {
  // Construire le data_check_string
  const dataCheckArr: string[] = [];
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "hash") {
      dataCheckArr.push(`${key}=${value}`);
    }
  });
  
  // Trier comme demandé dans la doc Telegram
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");
  
  // Secret key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  
  // Calcul du hash
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  
  return hash;
}

function generateTestHash(userId: number, username: string, firstName: string) {
  const authDate = Math.floor(Date.now() / 1000);
  
  const userData = {
    id: userId,
    first_name: firstName,
    username: username,
    language_code: "fr",
    is_premium: true,
    allows_write_to_pm: true,
  };
  
  const initData: Record<string, string> = {
    user: JSON.stringify(userData),
    chat_instance: `-${Math.floor(Math.random() * 10000000000000000)}`,
    chat_type: "sender",
    auth_date: authDate.toString(),
  };
  
  // Générer le hash
  const hash = generateTelegramHash(initData);
  initData.hash = hash;
  
  // Construire la string initData
  const params = new URLSearchParams(initData);
  const initDataString = params.toString();
  
  return {
    initData: initDataString,
    initDataEncoded: encodeURIComponent(initDataString),
    hash,
    userData,
  };
}

console.log("🔑 Génération de hash de test avec le token du bot\n");
console.log(`Token utilisé: ${BOT_TOKEN.substring(0, 10)}...${BOT_TOKEN.substring(BOT_TOKEN.length - 10)}\n`);

// Générer 6 hash de test
const testUsers = [
  { id: 6776172058, username: "christ_chtr", firstName: "Christina Charpentier" },
  { id: 123456789, username: "test_user_1", firstName: "Test User 1" },
  { id: 987654321, username: "test_user_2", firstName: "Test User 2" },
  { id: 111222333, username: "test_user_3", firstName: "Test User 3" },
  { id: 444555666, username: "test_user_4", firstName: "Test User 4" },
  { id: 777888999, username: "test_user_5", firstName: "Test User 5" },
];

console.log("📋 6 hash de test générés:\n");

testUsers.forEach((user, index) => {
  const result = generateTestHash(user.id, user.username, user.firstName);
  
  console.log(`\n${index + 1}. Utilisateur: @${user.username} (ID: ${user.id})`);
  console.log(`   Hash: ${result.hash}`);
  console.log(`   initData (raw): ${result.initData}`);
  console.log(`   initData (encoded): ${result.initDataEncoded}`);
  console.log(`   ──────────────────────────────────────────────`);
});

console.log("\n\n💡 Pour tester avec curl:");
console.log(`curl -X POST https://acepot.app/api/jobs/start \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"initData": "COLLER_LE_initData_encoded_ICI"}'`);

