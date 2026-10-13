/**
 * Couche d'abstraction données : bascule automatique entre mocks et Supabase réel
 * selon NEXT_PUBLIC_DEMO_MODE. Permet de tester le backend réel sans changer le code
 * de l'app (routes, components).
 */

export * from './core'

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
export * from './stats-service'
export * from './recruitment-advisor-service'
