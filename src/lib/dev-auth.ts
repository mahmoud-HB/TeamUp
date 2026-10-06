/**
 * Bypass d'authentification réservé au développement local : permet de
 * visualiser l'application (layout, navigation) sans backend Supabase
 * fonctionnel. **Jamais actif en production** (double verrou : build
 * `NODE_ENV` + variable d'environnement explicite à activer manuellement).
 *
 * Ce bypass ne crée AUCUNE session Supabase réelle : les pages qui
 * interrogent la base continueront d'afficher leurs états d'erreur/vide
 * tant qu'un vrai projet Supabase n'est pas configuré.
 */
export const DEV_BYPASS_COOKIE = "scoutly-dev-bypass";

export function isDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true"
  );
}
