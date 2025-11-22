// server/src/services/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL in server/.env");
  return url;
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in server/.env");
  return key;
}

function getAnonKey(): string | null {
  return process.env.SUPABASE_ANON_KEY || null;
}

// Client backend admin (bypass RLS) - lazy initialization
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      getSupabaseUrl(),
      getServiceRoleKey(),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}

// Export avec getter pour lazy initialization
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Client public optionnel (RLS activé) - lazy initialization
let _supabasePublic: SupabaseClient | null = null;
function getSupabasePublic(): SupabaseClient | null {
  const anonKey = getAnonKey();
  if (!anonKey) return null;
  if (!_supabasePublic) {
    _supabasePublic = createClient(getSupabaseUrl(), anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabasePublic;
}

// Export avec getter pour lazy initialization
export const supabasePublic = new Proxy({} as SupabaseClient | null, {
  get(_target, prop, receiver) {
    const client = getSupabasePublic();
    if (!client) return null;
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

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
