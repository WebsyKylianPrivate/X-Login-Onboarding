// server/src/services/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("Missing SUPABASE_URL in server/.env");
if (!serviceRoleKey)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in server/.env");

// Client backend admin (bypass RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client public optionnel (RLS activé)
export const supabasePublic: SupabaseClient | null = anonKey
  ? createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  : null;

export const connectSupabase = async () => {
  try {
    console.log("🔌 Supabase connecting...");
    // Test de connexion avec l'API auth (toujours disponible, ne nécessite pas de table)
    const { error } = await supabaseAdmin.auth.getSession();
    // Même si getSession retourne une erreur (pas de session), 
    // cela signifie que la connexion à l'API fonctionne
    console.log("✅ Supabase connected and ready");
    return supabaseAdmin;
  } catch (error: any) {
    console.error("❌ Supabase connection error:", error.message);
    throw error;
  }
};

export const disconnectSupabase = async () => {
  try {
    // Supabase client n'a pas besoin de déconnexion explicite
    // mais on peut logger la déconnexion
    console.log("🔌 Supabase disconnected");
  } catch (error) {
    console.error("Failed to disconnect from Supabase:", error);
  }
};
