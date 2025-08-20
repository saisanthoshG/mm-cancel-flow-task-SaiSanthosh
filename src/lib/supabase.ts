// // src/lib/supabase.ts
// // Supabase client configuration for database connections
// // Does not include authentication setup or advanced features

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// // Server-side client with service role key for admin operations
// export const supabaseAdmin = createClient(
//   supabaseUrl,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )

// src/lib/supabase.ts
"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Keep a single client instance on the window (hot-reload safe in dev)
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    // Never try to create the browser client on the server
    throw new Error(
      "getSupabase() called on the server. Use the server client there instead."
    );
  }

  if (globalThis.__supabase__) return globalThis.__supabase__;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Don’t crash the whole app – give a clear message in console and throw a *controlled* error
    // so you immediately see what's wrong during dev.
    // This prevents the generic “Application error” page with no clue.
    // Tip: double-check .env path + restart dev server.
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    throw new Error("Supabase env vars are missing");
  }

  globalThis.__supabase__ = createClient(url, anon);
  return globalThis.__supabase__!;
}
