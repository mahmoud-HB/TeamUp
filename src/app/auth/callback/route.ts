import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

/**
 * Point de retour OAuth (Google) et de validation de lien magique /
 * réinitialisation de mot de passe. Échange le code contre une session,
 * puis redirige vers la destination demandée (profil par défaut).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const locale =
    request.cookies.get("NEXT_LOCALE")?.value ?? routing.defaultLocale;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/${locale}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login`);
}
