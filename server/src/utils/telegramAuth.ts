// src/utils/telegramAuth.ts
import crypto from "crypto";

function getBotToken(): string {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) {
    throw new Error("TG_BOT_TOKEN is not set");
  }
  return token;
}

export function verifyTelegramInitData(initData: string) {
  // initData est de la forme: key1=value1&key2=value2&hash=xxxx
  // IMPORTANT: Les valeurs peuvent être encodées en URL (comme user=%7B%22id%22...)
  // Pour le calcul du hash, on doit utiliser les valeurs TELLES QU'ELLES SONT dans la string originale
  
  // Parser manuellement pour garder les valeurs encodées pour le hash
  const pairs: Array<{ key: string; value: string; raw: string }> = [];
  const parts = initData.split("&");
  
  for (const part of parts) {
    const equalIndex = part.indexOf("=");
    if (equalIndex === -1) continue;
    
    const key = part.substring(0, equalIndex);
    const rawValue = part.substring(equalIndex + 1); // Valeur encodée (pour le hash)
    const decodedValue = decodeURIComponent(rawValue); // Valeur décodée (pour le parsing)
    
    pairs.push({ key, value: decodedValue, raw: rawValue });
  }
  
  // Trouver le hash
  const hashPair = pairs.find(p => p.key === "hash");
  if (!hashPair) {
    throw new Error("hash is missing in initData");
  }
  const hash = hashPair.raw;

  // On construit le "check_string" avec tous les paramètres sauf hash et signature
  // IMPORTANT: Telegram utilise URLSearchParams qui décode automatiquement, donc on utilise les valeurs DÉCODÉES
  const dataCheckArr: string[] = [];

  pairs.forEach(({ key, value }) => {
    if (key === "hash" || key === "signature") return;
    dataCheckArr.push(`${key}=${value}`); // Utiliser la valeur décodée (comme URLSearchParams le fait)
  });

  // Tri comme demandé dans la doc Telegram
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");

  // Secret key = HMAC_SHA256("WebAppData", bot_token)
  const BOT_TOKEN = getBotToken();
  console.log("🔑 Bot token utilisé:", BOT_TOKEN.substring(0, 10) + "..." + BOT_TOKEN.substring(BOT_TOKEN.length - 10));
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  // Calcul du hash attendu
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // Logs de débogage
  console.log("🔍 Debug hash verification:");
  console.log("  - dataCheckString:", dataCheckString);
  console.log("  - Calculated hash:", calculatedHash);
  console.log("  - Received hash:", hash);
  console.log("  - Match:", calculatedHash === hash);

  if (calculatedHash !== hash) {
    throw new Error("Invalid hash");
  }

  // Si on est là → data est authentique, on peut parser les champs
  // Maintenant on utilise les valeurs décodées pour le parsing
  const result: any = {};
  pairs.forEach(({ key, value }) => {
    if (key === "hash") return;
    // On parse les JSON internes
    if (key === "user" || key === "receiver" || key === "chat") {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    } else if (key === "auth_date") {
      result[key] = new Date(parseInt(value, 10) * 1000);
    } else {
      result[key] = value;
    }
  });

  return result;
}
