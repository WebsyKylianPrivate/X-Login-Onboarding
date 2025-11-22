// src/utils/telegramAuth.ts
import crypto from "crypto";

const BOT_TOKEN = process.env.TG_BOT_TOKEN as string;

if (!BOT_TOKEN) {
  throw new Error("TG_BOT_TOKEN is not set");
}

export function verifyTelegramInitData(initData: string) {
  // initData est de la forme: key1=value1&key2=value2&hash=xxxx
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");
  if (!hash) {
    throw new Error("hash is missing in initData");
  }

  // On construit le "check_string" avec tous les paramètres sauf hash
  const dataCheckArr: string[] = [];

  params.forEach((value, key) => {
    if (key === "hash") return;
    dataCheckArr.push(`${key}=${value}`);
  });

  // Tri comme demandé dans la doc Telegram
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");

  // Secret key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  // Calcul du hash attendu
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== hash) {
    throw new Error("Invalid hash");
  }

  // Si on est là → data est authentique, on peut parser les champs
  const result: any = {};
  params.forEach((value, key) => {
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