"use client";

import { Home, Search, MessageCircle, Bell, UserRound, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { DevRole } from "@/lib/dev-auth";

type NavItem = {
  href: string;
  labelKey: "home" | "search" | "messages" | "notifications" | "profile";
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/search", labelKey: "search", icon: Search },
  { href: "/messages", labelKey: "messages", icon: MessageCircle },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/profile", labelKey: "profile", icon: UserRound },
];

/**
 * Coquille applicative responsive : barre de navigation basse sur mobile,
 * barre latérale sur desktop (≥ md). Partagée par tous les écrans
 * authentifiés de l'application (hors pages d'auth). Le libellé de
 * "Recherche" s'adapte au rôle (athlète vs recruteur/club).
 */
export function AppShell({
  children,
  role = "athlete",
}: {
  children: React.ReactNode;
  role?: DevRole;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchLabel = role === "recruiter" ? t("searchRecruiter") : t("searchAthlete");

  return (
    <div className="flex min-h-full w-full">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:px-4 md:py-6">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="size-4.5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">{t("appName")}</span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label={t("appName")}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const label = item.labelKey === "search" ? searchLabel : t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pt-6 text-xs text-muted-foreground">
          {role === "recruiter" ? "Espace recruteur / club" : "Espace athlète"}
        </div>
      </aside>

      <div className="flex min-h-full w-full flex-1 flex-col pb-16 md:pb-0">
        <main className="flex-1">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden"
        aria-label={t("appName")}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const label = item.labelKey === "search" ? searchLabel : t(item.labelKey);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
