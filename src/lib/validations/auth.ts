import { z } from "zod";

/** Fonction de traduction minimale attendue par les schémas (next-intl `useTranslations`/`getTranslations`). */
export type Translator = (key: string) => string;

export const ROLES = ["athlete", "recruiter", "organization"] as const;
export type UserRole = (typeof ROLES)[number];

const MIN_PASSWORD_LENGTH = 8;

export function createLoginSchema(t: Translator) {
  return z.object({
    email: z.email(t("emailInvalid")),
    password: z.string().min(1, t("required")),
  });
}
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createForgotPasswordSchema(t: Translator) {
  return z.object({
    email: z.email(t("emailInvalid")),
  });
}
export type ForgotPasswordInput = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export function createRegisterSchema(t: Translator) {
  return z
    .object({
      email: z.email(t("emailInvalid")),
      password: z.string().min(MIN_PASSWORD_LENGTH, t("passwordMin")),
      confirmPassword: z.string().min(1, t("required")),
      role: z.enum(ROLES),
      birthDate: z
        .string()
        .min(1, t("birthDateRequired"))
        .refine((value) => !Number.isNaN(Date.parse(value)), {
          message: t("birthDateRequired"),
        })
        .refine((value) => new Date(value).getTime() <= Date.now(), {
          message: t("birthDateFuture"),
        }),
      acceptTerms: z.literal(true, { error: t("termsRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });
}
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>;

/**
 * Calcule l'âge (en années complètes) à partir d'une date de naissance.
 * Utilisé pour appliquer les règles de protection des mineurs (< 18 ans).
 */
export function computeAge(birthDate: string | Date, now = new Date()): number {
  const birth = new Date(birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
}

export function isMinor(birthDate: string | Date, now = new Date()): boolean {
  return computeAge(birthDate, now) < 18;
}
