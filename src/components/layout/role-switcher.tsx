"use client";

import { useTransition } from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction, switchDevRoleAction } from "@/features/auth/actions";
import type { DevRole } from "@/lib/dev-auth";

/**
 * Bouton "changer de rôle" (démo uniquement) + "déconnecter" (toujours
 * disponible). Permet de basculer facilement entre l'interface athlète et
 * l'interface recruteur/club sans ressaisir d'identifiants.
 */
export function RoleSwitcher({
  role,
  isDevSession,
  compact = false,
}: {
  role: DevRole;
  isDevSession: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSwitchRole = () => {
    startTransition(async () => {
      await switchDevRoleAction();
      router.refresh();
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isDevSession && (
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon" : "sm"}
          disabled={isPending}
          onClick={handleSwitchRole}
          aria-label={
            role === "athlete" ? "Passer en mode recruteur" : "Passer en mode athlète"
          }
          title={role === "athlete" ? "Passer en mode recruteur" : "Passer en mode athlète"}
        >
          <RefreshCw className={compact ? "size-4" : "size-4 mr-1"} aria-hidden="true" />
          {!compact && (role === "athlete" ? "Mode recruteur" : "Mode athlète")}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        disabled={isPending}
        onClick={handleLogout}
        aria-label="Déconnecter"
        title="Déconnecter"
        className="text-muted-foreground hover:text-destructive"
      >
        <LogOut className={compact ? "size-4" : "size-4 mr-1"} aria-hidden="true" />
        {!compact && "Déconnecter"}
      </Button>
    </div>
  );
}
