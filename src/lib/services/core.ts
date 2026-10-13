/**
 * Helpers de base des services (sans dépendance) : évite les imports circulaires
 * avec index.ts qui ré-exporte tous les services.
 */

export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
};

export type DataSource = "demo" | "supabase";

export function getDataSource(): DataSource {
  return isDemoMode() ? "demo" : "supabase";
}

/**
 * Résultat générique d'une opération service (succès ou erreur)
 */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function err<T>(error: string, code?: string): ServiceResult<T> {
  return { ok: false, error, code };
}
