import { Trophy, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Layout des écrans d'authentification : panneau de marque en dégradé sur
 * desktop (≥ lg), formulaire centré sur mobile. Pas de navigation
 * applicative ici (utilisateur pas encore connecté).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <section className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-[oklch(0.45_0.18_250)] p-10 text-primary-foreground lg:flex xl:max-w-lg">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-black/10 blur-3xl"
          aria-hidden="true"
        />

        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Trophy className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <AppName />
          </span>
        </Link>

        <div className="relative flex flex-col gap-6">
          <MarketingCopy />
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} <AppName /> — démo de développement.
        </p>
      </section>

      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-10">
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="size-4.5" aria-hidden="true" />
            </span>
            <AppName />
          </Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function AppName() {
  const t = useTranslations("Nav");
  return <>{t("appName")}</>;
}

function MarketingCopy() {
  const t = useTranslations("Auth.marketing");
  return (
    <>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {t("tagline")}
      </span>
      <h2 className="text-2xl font-semibold leading-tight text-balance">
        {t("headline")}
      </h2>
      <ul className="flex flex-col gap-3 text-sm text-primary-foreground/90">
        <li className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-primary-foreground" />
          {t("point1")}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-primary-foreground" />
          {t("point2")}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-primary-foreground" />
          {t("point3")}
        </li>
      </ul>
    </>
  );
}
