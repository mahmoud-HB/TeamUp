import { redirect } from "@/i18n/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Layout des écrans applicatifs authentifiés : vérifie la session côté
 * serveur et redirige vers la connexion si l'utilisateur n'est pas connecté.
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

  if (!user) {
    redirect({ href: "/login", locale });
  }

  return <AppShell>{children}</AppShell>;
}
