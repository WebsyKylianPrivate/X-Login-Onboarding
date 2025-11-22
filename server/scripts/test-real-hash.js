// Test avec le vrai initData pour comprendre le format
const crypto = require("crypto");

const BOT_TOKEN = "8421940715:AAHLxbVBevOVvb979vTqr3rhQdRYdhMBupY";

// Vrai initData de Telegram
const realInitData = "query_id=AAEaLuQTAwAAABou5BMK0Nm4&user=%7B%22id%22%3A6776172058%2C%22first_name%22%3A%22Christina%20Charpentier%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22christ_chtr%22%2C%22language_code%22%3A%22fr%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FAY5UOM293OjvgJNFsjVJ282TbvvJaQN6Sr1RDcOCuEmFUcQCJVlzmhE7mKizoeas.svg%22%7D&auth_date=1763823264&signature=lYR3ULgS9q-hoSSlvzc20liAByMuU0mgJ5XAb9wPgWD1MuU4I4H7VEcfJYQQjh5L0PoiXai6GJ8FUi5JxCazDQ&hash=84dfb085541790652aaf7c69ef6e4d01646591c76b507f7054b3f6bffeca6f58";

function testHashCalculation(initData) {
  console.log("🔍 Test de calcul de hash avec le vrai initData\n");
  
  // Parser manuellement
  const pairs = [];
  const parts = initData.split("&");
  
  for (const part of parts) {
    const equalIndex = part.indexOf("=");
    if (equalIndex === -1) continue;
    
    const key = part.substring(0, equalIndex);
    const rawValue = part.substring(equalIndex + 1);
    
    pairs.push({ key, raw: rawValue });
  }
  
  // Trouver le hash attendu
  const hashPair = pairs.find(p => p.key === "hash");
  const expectedHash = hashPair ? hashPair.raw : null;
  
  console.log("Hash attendu:", expectedHash);
  console.log("\nParamètres trouvés:");
  pairs.forEach(p => {
    if (p.key !== "hash") {
      console.log(`  ${p.key}: ${p.raw.substring(0, 50)}...`);
    }
  });
  
  // Construire le dataCheckString (sans hash et signature)
  const dataCheckArr = [];
  pairs.forEach(({ key, raw }) => {
    if (key === "hash" || key === "signature") return;
    dataCheckArr.push(`${key}=${raw}`);
  });
  
  // Trier
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");
  
  console.log("\n📋 dataCheckString construit:");
  console.log(dataCheckString);
  
  // Calculer le hash
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  
  console.log("\n🔑 Hash calculé:", calculatedHash);
  console.log("✅ Hash attendu:", expectedHash);
  console.log("🎯 Match:", calculatedHash === expectedHash);
  
  if (calculatedHash !== expectedHash) {
    console.log("\n❌ Les hash ne correspondent pas!");
    console.log("\n💡 Vérifions si le problème vient de l'encodage...");
    
    // Essayer avec les valeurs décodées
    const dataCheckArrDecoded = [];
    pairs.forEach(({ key, raw }) => {
      if (key === "hash" || key === "signature") return;
      try {
        const decoded = decodeURIComponent(raw);
        dataCheckArrDecoded.push(`${key}=${decoded}`);
      } catch {
        dataCheckArrDecoded.push(`${key}=${raw}`);
      }
    });
    
    dataCheckArrDecoded.sort();
    const dataCheckStringDecoded = dataCheckArrDecoded.join("\n");
    
    console.log("\n📋 dataCheckString avec valeurs décodées:");
    console.log(dataCheckStringDecoded);
    
    const calculatedHashDecoded = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckStringDecoded)
      .digest("hex");
    
    console.log("\n🔑 Hash calculé (décodé):", calculatedHashDecoded);
    console.log("🎯 Match (décodé):", calculatedHashDecoded === expectedHash);
  }
}

testHashCalculation(realInitData);

