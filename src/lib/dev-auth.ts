/**
 * Bypass d'authentification pour visualiser l'application sans backend
 * Supabase fonctionnel (dev local, ou démo publique en ligne explicitement
 * autorisée).
 *
 * Verrous (il faut TOUS les satisfaire) :
 * 1. `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` (toujours requis).
 * 2. ET soit on n'est pas en production (`NODE_ENV !== "production"`),
 *    soit `NEXT_PUBLIC_ALLOW_PUBLIC_DEMO=true` est positionné explicitement
 *    (opt-in volontaire pour un déploiement de démo public en lecture
 *    seule — jamais activé par défaut).
 *
 * Ce bypass ne crée AUCUNE session Supabase réelle : les pages qui
 * interrogent la base continueront d'afficher leurs états d'erreur/vide
 * tant qu'un vrai projet Supabase n'est pas configuré.
 */
export const DEV_BYPASS_COOKIE = "scoutly-dev-bypass";
export const DEV_ROLE_COOKIE = "scoutly-dev-role";

export type DevRole = "athlete" | "recruiter";

export function isDevBypassEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== "true") return false;

  const isProduction = process.env.NODE_ENV === "production";
  const publicDemoAllowed = process.env.NEXT_PUBLIC_ALLOW_PUBLIC_DEMO === "true";

  return !isProduction || publicDemoAllowed;
}

export function parseDevRole(value: string | undefined): DevRole {
  return value === "recruiter" ? "recruiter" : "athlete";
}
