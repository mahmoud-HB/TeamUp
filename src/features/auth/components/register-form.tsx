"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerAction, type AuthActionState } from "@/features/auth/actions";
import { ROLES, type UserRole } from "@/lib/validations/auth";

const INITIAL_STATE: AuthActionState = { status: "idle" };

export function RegisterForm() {
  const t = useTranslations("Auth.register");
  const [role, setRole] = useState<UserRole>("athlete");
  const [state, formAction, isPending] = useActionState(
    registerAction,
    INITIAL_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      // Redirige vers la connexion : l'utilisateur doit confirmer son
      // e-mail avant de pouvoir compléter son profil.
      const timeout = setTimeout(() => router.push("/login"), 2500);
      return () => clearTimeout(timeout);
    }
  }, [state.status, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        {state.status === "success" ? (
          <p className="text-sm text-foreground" role="status">
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">{t("role")}</Label>
              <input type="hidden" name="role" value={role} />
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(
                        `role${r.charAt(0).toUpperCase() + r.slice(1)}` as
                          | "roleAthlete"
                          | "roleRecruiter"
                          | "roleOrganization",
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(state.fieldErrors?.email)}
              />
              {state.fieldErrors?.email && (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthDate">{t("birthDate")}</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={Boolean(state.fieldErrors?.birthDate)}
                aria-describedby="birthDate-hint"
              />
              <p id="birthDate-hint" className="text-xs text-muted-foreground">
                {t("birthDateHint")}
              </p>
              {state.fieldErrors?.birthDate && (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.birthDate}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(state.fieldErrors?.password)}
              />
              {state.fieldErrors?.password && (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              />
              {state.fieldErrors?.confirmPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                required
                className="mt-1 size-4 rounded border-input"
                aria-invalid={Boolean(state.fieldErrors?.acceptTerms)}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal">
                {t("acceptTerms")}
              </Label>
            </div>
            {state.fieldErrors?.acceptTerms && (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.acceptTerms}
              </p>
            )}

            {state.status === "error" && state.message && (
              <p className="text-sm text-destructive" role="alert">
                {state.message}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "…" : t("submit")}
            </Button>
          </form>
        )}

        {state.status !== "success" && (
          <>
            <div className="my-4 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <GoogleAuthButton labelKey="register" />
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("login")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
