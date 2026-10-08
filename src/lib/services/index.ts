/**
 * Couche d'abstraction données : bascule automatique entre mocks et Supabase réel
 * selon NEXT_PUBLIC_DEMO_MODE. Permet de tester le backend réel sans changer le code
 * de l'app (routes, components).
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

// Core services
export * from './post-service'
export * from './search-service'
export * from './follow-service'
export * from './teams-service'
export * from './offers-service'
export * from './messaging-service'
export * from './notifications-service'
export * from './moderation-service'

// Enhanced features
export * from './realtime-service'
export * from './storage-service'
export * from './email-service'
export * from './analytics-service'
export * from './push-notification-service'
