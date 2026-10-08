/**
 * AppService: utilitaires d'app (analytics, Capacitor prep)
 */

import { ServiceResult, ok } from "./index";

export interface AppConfig {
  version: string;
  isNative: boolean;
  platform?: 'ios' | 'android' | 'web';
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export const AppService = {
  async getConfig(): Promise<ServiceResult<AppConfig>> {
    const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor;
    return ok({
      version: '1.0.0',
      isNative,
      platform: isNative ? 'web' : undefined,
    });
  },

  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<ServiceResult<null>> {
    const event: AnalyticsEvent = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      console.log('[Analytics]', event);
    }
    return ok(null);
  },

  async getDeviceInfo(): Promise<ServiceResult<{ userAgent: string; language: string }>> {
    return ok({
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      language: typeof navigator !== 'undefined' ? navigator.language : 'unknown',
    });
  },
};
