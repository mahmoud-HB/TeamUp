import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Rafraîchit la session Supabase à chaque requête (nécessaire car les
 * Server Components ne peuvent pas écrire de cookies) et applique les
 * cookies mis à jour sur la réponse fournie (par ex. celle de next-intl),
 * afin de ne pas perdre le rafraîchissement de session lors d'un rewrite
 * ou d'une redirection de locale.
 */
export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Déclenche le rafraîchissement du token si nécessaire ; les cookies
  // mis à jour sont écrits directement sur `response` ci-dessus.
  await supabase.auth.getUser();

  return response;
}
