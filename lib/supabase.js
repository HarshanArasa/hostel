import { createClient } from '@supabase/supabase-js';

let _supabase = null;
let _supabaseAdmin = null;

/**
 * Returns the public Supabase client (browser-safe, respects RLS).
 * Lazy-initialized so Next.js can build without real env values.
 */
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

/**
 * Returns the admin Supabase client (server-side only, bypasses RLS).
 * Uses the Service Role key — never expose this to the browser.
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return _supabaseAdmin;
}
