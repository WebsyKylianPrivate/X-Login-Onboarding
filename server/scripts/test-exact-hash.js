const crypto = require("crypto");

const BOT_TOKEN = "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

// Vrai initData EXACT de Telegram
const realInitData = "query_id=AAEaLuQTAwAAABou5BM127WY&user=%7B%22id%22%3A6776172058%2C%22first_name%22%3A%22Christina%20Charpentier%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22christ_chtr%22%2C%22language_code%22%3A%22fr%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAY5UOM293OjvgJNFsjVJ282TbvvJaQN6Sr1RDcOCuEmFUcQCJVlzmhE7mKizoeas.svg%22%7D&auth_date=1763823514&signature=usPUnWdUg_vKcSZJW9I9e0Gb2LiLJw3b-WJfgvBB-9K5qkTv7wD6qDSENAkZA7XbL9no8OtE0V_g9knTtO4HBQ&hash=38fd25844131543aacbe7fb5b54911adf9b759755efc34bd2d912c9cd59ff5a5";

const expectedHash = "38fd25844131543aacbe7fb5b54911adf9b759755efc34bd2d912c9cd59ff5a5";

console.log("🔍 Test avec le VRAI initData de Telegram\n");
console.log("Hash attendu:", expectedHash);
console.log("\n");

// Parser avec URLSearchParams (comme Telegram le fait)
const params = new URLSearchParams(realInitData);

console.log("Paramètres (décodés par URLSearchParams):");
const dataCheckArr = [];
params.forEach((value, key) => {
  if (key === "hash" || key === "signature") return;
  console.log(`  ${key}: ${value.substring(0, 80)}...`);
  dataCheckArr.push(`${key}=${value}`);
});

// Trier
dataCheckArr.sort();
const dataCheckString = dataCheckArr.join("\n");

console.log("\n📋 dataCheckString:");
console.log(dataCheckString);
console.log("\n");

// Calculer le hash
const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

console.log("🔑 Hash calculé:", calculatedHash);
console.log("✅ Hash attendu:", expectedHash);
console.log("🎯 Match:", calculatedHash === expectedHash);

if (calculatedHash !== expectedHash) {
  console.log("\n❌ Les hash ne correspondent pas!");
  console.log("\n💡 Vérifions le format exact du user JSON...");
  
  const userValue = params.get("user");
  console.log("\nUser value (décodé):", userValue);
  console.log("User value (JSON stringifié):", JSON.stringify(JSON.parse(userValue)));
  
  // Essayer avec le JSON tel quel (sans ré-encoder)
  const userParsed = JSON.parse(userValue);
  const userReStringified = JSON.stringify(userParsed);
  console.log("\nUser re-stringifié:", userReStringified);
  console.log("Match avec original:", userValue === userReStringified);
}

