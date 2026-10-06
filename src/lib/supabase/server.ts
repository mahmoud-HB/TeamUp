import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Client Supabase pour les Server Components / Server Actions / Route
 * Handlers. Lit et écrit la session via les cookies de première partie
 * (gérés par Next.js), jamais de cookies tiers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` appelé depuis un Server Component : ignoré si un
            // middleware gère déjà le rafraîchissement de session.
          }
        },
      },
    },
  );
}
