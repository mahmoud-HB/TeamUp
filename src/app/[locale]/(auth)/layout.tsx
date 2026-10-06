import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Layout centré, minimal, pour les écrans d'authentification (connexion,
 * inscription, mot de passe oublié) — pas de navigation applicative.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          <AppName />
        </Link>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function AppName() {
  const t = useTranslations("Nav");
  return <>{t("appName")}</>;
}
