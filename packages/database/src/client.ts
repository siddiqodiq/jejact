import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Explicit SupabaseClient type: ReturnType<typeof createClient> collapses
// the schema generics to `never`, breaking every .from() call site.
let _supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("Initializing Supabase with URL:", supabaseUrl);
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  return _supabase;
}
