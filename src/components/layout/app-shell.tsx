"use client";

import { Home, Search, MessageCircle, Bell, UserRound, Trophy, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { DevRole } from "@/lib/dev-auth";

type NavItem = {
  href: string;
  labelKey: "home" | "search" | "messages" | "notifications" | "profile" | "assistant";
  icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/search", labelKey: "search", icon: Search },
  { href: "/assistant", labelKey: "assistant", icon: Sparkles },
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
  isDevSession = false,
}: {
  children: React.ReactNode;
  role?: DevRole;
  isDevSession?: boolean;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchLabel = role === "recruiter" ? t("searchRecruiter") : t("searchAthlete");

  return (
    <div className="flex min-h-full w-full">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/60 md:bg-card/40 md:px-4 md:py-6 md:backdrop-blur-sm">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.5_0.17_190)] text-primary-foreground shadow-sm shadow-primary/30">
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
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 h-5 w-1 rounded-r-full bg-primary"
                    aria-hidden="true"
                  />
                )}
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                role === "recruiter" ? "bg-[oklch(0.65_0.17_40)]" : "bg-success",
              )}
              aria-hidden="true"
            />
            {role === "recruiter" ? "Espace recruteur / club" : "Espace athlète"}
          </div>
          <div className="flex items-center gap-2">
            <RoleSwitcher role={role} isDevSession={isDevSession} />
            <ThemeToggle compact />
          </div>
        </div>
      </aside>

      <div className="flex min-h-full w-full flex-1 flex-col pb-16 md:pb-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-2 backdrop-blur-md md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.5_0.17_190)] text-primary-foreground shadow-sm shadow-primary/30">
              <Trophy className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight">{t("appName")}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <RoleSwitcher role={role} isDevSession={isDevSession} compact />
            <ThemeToggle compact />
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border/60 bg-background/90 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
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
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-all",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("size-5 transition-transform", isActive && "scale-110")}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
