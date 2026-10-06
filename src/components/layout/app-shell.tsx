"use client";

import { Home, Search, MessageCircle, Bell, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
 * authentifiés de l'application (hors pages d'auth).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <div className="flex min-h-full w-full">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:px-4 md:py-6">
        <span className="px-2 pb-6 text-lg font-semibold">
          {t("appName")}
        </span>
        <nav className="flex flex-col gap-1" aria-label={t("appName")}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
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
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
