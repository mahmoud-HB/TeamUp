import { redirect } from "@/i18n/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDevSession } from "@/lib/dev-session";
import type { DevRole } from "@/lib/dev-auth";

/**
 * Layout des écrans applicatifs authentifiés : vérifie la session côté
 * serveur et redirige vers la connexion si l'utilisateur n'est pas connecté.
 *
 * Exception strictement limitée au développement local : si une session de
 * démo est active (voir `lib/dev-session.ts`), l'accès est autorisé sans
 * session Supabase réelle, pour permettre de visualiser l'UI (avec des
 * données 100% fictives). Jamais actif en production.
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

  const devSession = await getDevSession();

  if (!user && !devSession) {
    redirect({ href: "/login", locale });
  }

  const role: DevRole =
    devSession?.role ??
    (user?.user_metadata?.role === "recruiter" ||
    user?.user_metadata?.role === "organization"
      ? "recruiter"
      : "athlete");

  return (
    <AppShell role={role} isDevSession={!!devSession}>
      {devSession && (
        <div
          role="status"
          className="bg-warning/15 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-300"
        >
          Mode démo : session et données 100% fictives.
        </div>
      )}
      <OnboardingTour role={role} />
      {children}
    </AppShell>
  );
}
