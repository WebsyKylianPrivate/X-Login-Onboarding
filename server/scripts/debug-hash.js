const crypto = require("crypto");

const BOT_TOKEN = "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

// Vrai initData de Telegram (sans le hash à la fin pour tester)
const testInitData = "query_id=AAEaLuQTAwAAABou5BMK0Nm4&user=%7B%22id%22%3A6776172058%2C%22first_name%22%3A%22Christina%20Charpentier%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22christ_chtr%22%2C%22language_code%22%3A%22fr%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAY5UOM293OjvgJNFsjVJ282TbvvJaQN6Sr1RDcOCuEmFUcQCJVlzmhE7mKizoeas.svg%22%7D&auth_date=1763823264&signature=lYR3ULgS9q-hoSSlvzc20liAByMuU0mgJ5XAb9wPgWD1MuU4I4H7VEcfJYQQjh5L0PoiXai6GJ8FUi5JxCazDQ&hash=84dfb085541790652aaf7c69ef6e4d01646591c76b507f7054b3f6bffeca6f58";

const expectedHash = "84dfb085541790652aaf7c69ef6e4d01646591c76b507f7054b3f6bffeca6f58";

console.log("🔍 Test de calcul de hash\n");
console.log("Token:", BOT_TOKEN.substring(0, 10) + "..." + BOT_TOKEN.substring(BOT_TOKEN.length - 10));
console.log("Hash attendu:", expectedHash);
console.log("\n");

// Parser
const pairs = [];
const parts = testInitData.split("&");

for (const part of parts) {
  const equalIndex = part.indexOf("=");
  if (equalIndex === -1) continue;
  const key = part.substring(0, equalIndex);
  const rawValue = part.substring(equalIndex + 1);
  pairs.push({ key, raw: rawValue });
}

console.log("Paramètres trouvés:");
pairs.forEach(p => {
  if (p.key !== "hash") {
    const preview = p.raw.length > 60 ? p.raw.substring(0, 60) + "..." : p.raw;
    console.log(`  ${p.key}: ${preview}`);
  }
});

// Méthode 1: Avec valeurs encodées (comme actuellement)
const dataCheckArr1 = [];
pairs.forEach(({ key, raw }) => {
  if (key === "hash" || key === "signature") return;
  dataCheckArr1.push(`${key}=${raw}`);
});
dataCheckArr1.sort();
const dataCheckString1 = dataCheckArr1.join("\n");

console.log("\n📋 Méthode 1 - dataCheckString (valeurs encodées):");
console.log(dataCheckString1);

const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
const hash1 = crypto.createHmac("sha256", secretKey).update(dataCheckString1).digest("hex");

console.log("Hash calculé:", hash1);
console.log("Match:", hash1 === expectedHash);

// Méthode 2: Essayer avec URLSearchParams (comme Telegram pourrait le faire)
console.log("\n📋 Méthode 2 - Test avec URLSearchParams:");
const params = new URLSearchParams(testInitData);
const dataCheckArr2 = [];
params.forEach((value, key) => {
  if (key === "hash" || key === "signature") return;
  dataCheckArr2.push(`${key}=${value}`);
});
dataCheckArr2.sort();
const dataCheckString2 = dataCheckArr2.join("\n");

console.log(dataCheckString2);
const hash2 = crypto.createHmac("sha256", secretKey).update(dataCheckString2).digest("hex");
console.log("Hash calculé:", hash2);
console.log("Match:", hash2 === expectedHash);

