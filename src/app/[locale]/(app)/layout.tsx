import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_BYPASS_COOKIE, isDevBypassEnabled } from "@/lib/dev-auth";

/**
 * Layout des écrans applicatifs authentifiés : vérifie la session côté
 * serveur et redirige vers la connexion si l'utilisateur n'est pas connecté.
 *
 * Exception strictement limitée au développement local : si le cookie de
 * bypass dev est présent (voir `lib/dev-auth.ts`), l'accès est autorisé sans
 * session Supabase réelle, pour permettre de visualiser l'UI sans backend
 * fonctionnel. Jamais actif en production.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const hasDevBypass =
    isDevBypassEnabled() && cookieStore.get(DEV_BYPASS_COOKIE)?.value === "1";

  if (!user && !hasDevBypass) {
    redirect({ href: "/login", locale });
  }

  return (
    <AppShell>
      {!user && hasDevBypass && (
        <div
          role="status"
          className="bg-amber-500/15 px-4 py-2 text-center text-xs font-medium text-amber-600 dark:text-amber-400"
        >
          Mode développeur : session factice, aucune donnée réelle.
        </div>
      )}
      {children}
    </AppShell>
  );
}
