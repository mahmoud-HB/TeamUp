"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Client Supabase pour le navigateur. Utilise le storage localStorage par
 * défaut (pas de cookies tiers) afin de rester compatible avec l'encapsulation
 * Capacitor (WebView) prévue pour l'application mobile.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
