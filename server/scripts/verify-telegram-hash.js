// Script pour tester le calcul de hash selon la documentation Telegram officielle
const crypto = require("crypto");

const BOT_TOKEN = "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

// Vrai initData de Telegram
const realInitData = "query_id=AAEaLuQTAwAAABou5BM127WY&user=%7B%22id%22%3A6776172058%2C%22first_name%22%3A%22Christina%20Charpentier%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22christ_chtr%22%2C%22language_code%22%3A%22fr%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAY5UOM293OjvgJNFsjVJ282TbvvJaQN6Sr1RDcOCuEmFUcQCJVlzmhE7mKizoeas.svg%22%7D&auth_date=1763823514&signature=usPUnWdUg_vKcSZJW9I9e0Gb2LiLJw3b-WJfgvBB-9K5qkTv7wD6qDSENAkZA7XbL9no8OtE0V_g9knTtO4HBQ&hash=38fd25844131543aacbe7fb5b54911adf9b759755efc34bd2d912c9cd59ff5a5";

const expectedHash = "38fd25844131543aacbe7fb5b54911adf9b759755efc34bd2d912c9cd59ff5a5";

console.log("🔍 Test selon documentation Telegram officielle\n");

// Méthode 1: Utiliser les valeurs telles qu'elles sont dans l'URL (encodées)
console.log("📋 Méthode 1: Valeurs encodées (comme dans l'URL)");
const pairs1 = [];
const parts1 = realInitData.split("&");
for (const part of parts1) {
  const eq = part.indexOf("=");
  if (eq === -1) continue;
  const key = part.substring(0, eq);
  const raw = part.substring(eq + 1);
  pairs1.push({ key, raw });
}

const hash1 = pairs1.find(p => p.key === "hash")?.raw;
const dataCheckArr1 = [];
pairs1.forEach(({ key, raw }) => {
  if (key === "hash" || key === "signature") return;
  dataCheckArr1.push(`${key}=${raw}`);
});
dataCheckArr1.sort();
const dataCheckString1 = dataCheckArr1.join("\n");

const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
const calculatedHash1 = crypto.createHmac("sha256", secretKey).update(dataCheckString1).digest("hex");

console.log("dataCheckString:", dataCheckString1.substring(0, 100) + "...");
console.log("Hash calculé:", calculatedHash1);
console.log("Hash attendu:", expectedHash);
console.log("Match:", calculatedHash1 === expectedHash);
console.log("\n");

// Méthode 2: Utiliser URLSearchParams (valeurs décodées)
console.log("📋 Méthode 2: URLSearchParams (valeurs décodées)");
const params2 = new URLSearchParams(realInitData);
const hash2 = params2.get("hash");
const dataCheckArr2 = [];
params2.forEach((value, key) => {
  if (key === "hash" || key === "signature") return;
  dataCheckArr2.push(`${key}=${value}`);
});
dataCheckArr2.sort();
const dataCheckString2 = dataCheckArr2.join("\n");

const calculatedHash2 = crypto.createHmac("sha256", secretKey).update(dataCheckString2).digest("hex");

console.log("dataCheckString:", dataCheckString2.substring(0, 100) + "...");
console.log("Hash calculé:", calculatedHash2);
console.log("Hash attendu:", expectedHash);
console.log("Match:", calculatedHash2 === expectedHash);

