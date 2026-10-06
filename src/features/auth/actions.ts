"use server";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEV_BYPASS_COOKIE, DEV_ROLE_COOKIE, isDevBypassEnabled, type DevRole } from "@/lib/dev-auth";
import {
  createForgotPasswordSchema,
  createLoginSchema,
  createRegisterSchema,
} from "@/lib/validations/auth";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function flattenFieldErrors(
  error: { issues: { path: PropertyKey[]; message: string }[] },
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("Validation");
  const schema = createLoginSchema(t);
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const tAuth = await getTranslations("Auth.login");
    return { status: "error", message: tAuth("error") };
  }

  return { status: "success" };
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("Validation");
  const schema = createRegisterSchema(t);
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    birthDate: formData.get("birthDate"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        role: parsed.data.role,
        birth_date: parsed.data.birthDate,
      },
    },
  });

  if (error) {
    const tAuth = await getTranslations("Auth.register");
    return { status: "error", message: tAuth("error") };
  }

  const tAuth = await getTranslations("Auth.register");
  return { status: "success", message: tAuth("success") };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const t = await getTranslations("Validation");
  const schema = createForgotPasswordSchema(t);
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  // On ignore volontairement l'éventuelle erreur ("email inconnu") pour ne
  // pas divulguer l'existence d'un compte (anti-énumération).
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/profile/edit`,
  });

  const tAuth = await getTranslations("Auth.forgotPassword");
  return { status: "success", message: tAuth("success") };
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return { status: "error" as const };
  }

  return { status: "success" as const, url: data.url };
}

/**
 * Connexion factice réservée au développement local (voir `lib/dev-auth.ts`).
 * N'établit aucune session Supabase : pose uniquement des cookies non
 * sensibles (bypass + rôle démo) permettant au layout authentifié de
 * laisser passer l'utilisateur pour visualiser l'UI sans backend
 * fonctionnel, avec des données 100% fictives.
 */
export async function devBypassLoginAction(
  role: DevRole,
): Promise<AuthActionState> {
  if (!isDevBypassEnabled()) {
    return { status: "error", message: "Dev login is disabled." };
  }

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  };
  cookieStore.set(DEV_BYPASS_COOKIE, "1", cookieOptions);
  cookieStore.set(DEV_ROLE_COOKIE, role, cookieOptions);

  return { status: "success" };
}
