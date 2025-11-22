// scripts/generate-hash.js
const crypto = require("crypto");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const BOT_TOKEN = process.env.TG_BOT_TOKEN || "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

function generateTelegramHash(data) {
  const dataCheckArr = [];
  
  Object.entries(data).forEach(([key, value]) => {
    // Exclure hash et signature du calcul
    if (key !== "hash" && key !== "signature") {
      dataCheckArr.push(`${key}=${value}`);
    }
  });
  
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");
  
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  
  return hash;
}

function generateQueryId() {
  // Format: AAEaLuQTAwAAABou5BOsZdxV (22 caractères, base64-like)
  const randomBytes = crypto.randomBytes(16);
  return randomBytes.toString('base64').substring(0, 22).replace(/\+/g, 'A').replace(/\//g, 'B');
}

function generateSignature() {
  // Format: a4hHsnzblXl9_KVFpHGAjcYkI4dOavWCRa2FcVl42DY2XZ3bpKgvVFMXRNy2ZPRULFEYqdWQMEpSpuoIKqELAA
  const randomBytes = crypto.randomBytes(32);
  return randomBytes.toString('base64').substring(0, 86).replace(/\+/g, 'a').replace(/\//g, 'b');
}

function generateTestHash(userId, username, firstName, lastName = "") {
  const authDate = Math.floor(Date.now() / 1000);
  
  const userData = {
    id: userId,
    first_name: firstName,
    last_name: lastName,
    username: username,
    language_code: "fr",
    is_premium: true,
    allows_write_to_pm: true,
  };
  
  // Format réel de Telegram avec query_id et signature
  const initData = {
    query_id: generateQueryId(),
    user: JSON.stringify(userData), // Pas d'espaces dans le JSON
    auth_date: authDate.toString(),
    signature: generateSignature(),
  };
  
  const hash = generateTelegramHash(initData);
  initData.hash = hash;
  
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

const testUsers = [
  { id: 6776172058, username: "christ_chtr", firstName: "Christina Charpentier", lastName: "" },
  { id: 123456789, username: "test_user_1", firstName: "Test User 1", lastName: "" },
  { id: 987654321, username: "test_user_2", firstName: "Test User 2", lastName: "" },
  { id: 111222333, username: "test_user_3", firstName: "Test User 3", lastName: "" },
  { id: 444555666, username: "test_user_4", firstName: "Test User 4", lastName: "" },
  { id: 777888999, username: "test_user_5", firstName: "Test User 5", lastName: "" },
];

console.log("📋 6 hash de test générés:\n");

testUsers.forEach((user, index) => {
  const result = generateTestHash(user.id, user.username, user.firstName, user.lastName || "");
  
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

