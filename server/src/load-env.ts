import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env files: first root, then server/.env (server overrides root)
// server/.env path: from server/src/load-env.ts -> server/.env
const serverEnvPath = resolve(__dirname, "../../.env");
// root .env path: from server/src/load-env.ts -> root/.env
const rootEnvPath = resolve(__dirname, "../../../.env");

// Load root .env first (if exists)
if (existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

// Then load server/.env (overrides root values if both exist)
if (existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (!existsSync(rootEnvPath)) {
  // Fallback to default behavior only if neither file exists
  dotenv.config();
}

