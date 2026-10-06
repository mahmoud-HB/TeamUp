import { defineRouting } from "next-intl/routing";

/** Locales supportées par l'application. */
export const locales = ["fr", "en"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "fr";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
