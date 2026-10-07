"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * Bascule clair / sombre accessible (WCAG AA). Le thème clair est la valeur
 * par défaut de l'application pour rester lisible et moderne ; ce bouton
 * permet aux utilisateurs qui préfèrent un thème sombre de l'activer.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Évite un mismatch d'hydratation : le thème résolu n'est connu que côté client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation nécessaire pour éviter un mismatch d'hydratation (thème résolu indisponible en SSR)
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon" : "sm"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
    >
      {isDark ? (
        <Sun className={compact ? "size-4" : "size-4 mr-1"} aria-hidden="true" />
      ) : (
        <Moon className={compact ? "size-4" : "size-4 mr-1"} aria-hidden="true" />
      )}
      {!compact && (isDark ? "Thème clair" : "Thème sombre")}
    </Button>
  );
}
