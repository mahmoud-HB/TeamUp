import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const handleIntl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // next-intl calcule d'abord la réponse (rewrite/redirection de locale),
  // puis on y applique le rafraîchissement de session Supabase pour ne pas
  // perdre les cookies mis à jour. Le callback OAuth (/auth/callback) est
  // exclu de ce middleware via le matcher ci-dessous.
  const response = handleIntl(request);
  return updateSupabaseSession(request, response);
}

export const config = {
  // Exclut les fichiers statiques, l'API, le callback OAuth et les assets
  // Next internes de la logique de routage i18n.
  matcher: ["/((?!api|trpc|auth/callback|_next|_vercel|.*\\..*).*)"],
};
