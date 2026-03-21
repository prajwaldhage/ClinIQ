import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser client (client components only — no next/headers) ───────────────
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  // Debug logging
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase configuration missing:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlStart: supabaseUrl?.substring(0, 20),
      keyStart: supabaseAnonKey?.substring(0, 10),
    });
    throw new Error("Supabase URL or Anon Key is missing from environment variables");
  }

  console.log("Initializing Supabase client:", {
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey.substring(0, 10) + "...",
    keyLength: supabaseAnonKey.length,
  });

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
