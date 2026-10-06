import { z } from "zod";
import type { Translator } from "./auth";
import { isMinor } from "./auth";

export const SPORT_LEVELS = [
  "beginner",
  "amateur",
  "semi_pro",
  "pro",
] as const;
export type SportLevel = (typeof SPORT_LEVELS)[number];

export const AVAILABILITY_STATUSES = [
  "free",
  "under_contract",
  "on_loan",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const VISIBILITY_OPTIONS = [
  "public",
  "verified_only",
  "private",
] as const;
export type Visibility = (typeof VISIBILITY_OPTIONS)[number];

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export function createIdentityStepSchema(t: Translator) {
  return z.object({
    username: z
      .string()
      .min(3, t("usernameMin"))
      .max(30, t("usernameMax"))
      .regex(USERNAME_REGEX, t("usernameFormat")),
    avatarUrl: z.url().optional().or(z.literal("")),
    bio: z.string().max(500, t("bioMax")).optional().or(z.literal("")),
    country: z.string().min(1, t("required")),
    birthDate: z
      .string()
      .min(1, t("birthDateRequired"))
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: t("birthDateRequired"),
      })
      .refine((value) => new Date(value).getTime() <= Date.now(), {
        message: t("birthDateFuture"),
      }),
  });
}
export type IdentityStepInput = z.infer<
  ReturnType<typeof createIdentityStepSchema>
>;

export function createAthleteSportSchema(t: Translator) {
  return z.object({
    sportId: z.string().min(1, t("sportsRequired")),
    positionId: z.string().optional().or(z.literal("")),
    level: z.enum(SPORT_LEVELS, { error: t("levelRequired") }),
  });
}

export function createSportsStepSchema(t: Translator) {
  return z.object({
    sports: z
      .array(createAthleteSportSchema(t))
      .min(1, t("sportsRequired")),
  });
}
export type SportsStepInput = z.infer<
  ReturnType<typeof createSportsStepSchema>
>;

export function createAvailabilityStepSchema() {
  return z.object({
    status: z.enum(AVAILABILITY_STATUSES),
    mobility: z.boolean(),
  });
}
export type AvailabilityStepInput = z.infer<
  ReturnType<typeof createAvailabilityStepSchema>
>;

export function createVisibilityStepSchema() {
  return z.object({
    visibility: z.enum(VISIBILITY_OPTIONS),
  });
}
export type VisibilityStepInput = z.infer<
  ReturnType<typeof createVisibilityStepSchema>
>;

/**
 * Schéma complet du profil athlète (fusion des 4 étapes du formulaire
 * guidé), utilisé pour la validation finale côté serveur avant écriture
 * en base.
 */
export function createAthleteProfileSchema(t: Translator) {
  return createIdentityStepSchema(t)
    .extend(createSportsStepSchema(t).shape)
    .extend(createAvailabilityStepSchema().shape)
    .extend(createVisibilityStepSchema().shape)
    .superRefine((data, ctx) => {
      // Règle de protection des mineurs : un profil de moins de 18 ans ne
      // peut pas être rendu public (seules les visibilités restreintes
      // sont autorisées tant qu'un tuteur n'a pas validé l'ouverture).
      if (isMinor(data.birthDate) && data.visibility === "public") {
        ctx.addIssue({
          code: "custom",
          path: ["visibility"],
          message: t("minorVisibilityRestricted"),
        });
      }
    });
}
export type AthleteProfileInput = z.infer<
  ReturnType<typeof createAthleteProfileSchema>
>;
