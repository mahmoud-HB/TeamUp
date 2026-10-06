"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import {
  devBypassLoginAction,
  loginAction,
  type AuthActionState,
} from "@/features/auth/actions";

const INITIAL_STATE: AuthActionState = { status: "idle" };

// Variable publique (NEXT_PUBLIC_*) : simple affichage conditionnel du
// bouton côté client. Le vrai verrou de sécurité est côté serveur dans
// `devBypassLoginAction` (voir lib/dev-auth.ts) — jamais actif en prod.
const DEV_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";

export function LoginForm() {
  const t = useTranslations("Auth.login");
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );
  const [devState, devFormAction, isDevPending] = useActionState(
    async (_prev: AuthActionState, formData: FormData) =>
      devBypassLoginAction(
        formData.get("role") === "recruiter" ? "recruiter" : "athlete",
      ),
    INITIAL_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (devState.status === "success") {
      router.push("/");
      router.refresh();
    }
  }, [devState.status, router]);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/");
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={
                state.fieldErrors?.email ? "email-error" : undefined
              }
            />
            {state.fieldErrors?.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          {state.status === "error" && state.message && (
            <p className="text-sm text-destructive" role="alert">
              {state.message}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="mt-2">
            {isPending ? "…" : t("submit")}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        <GoogleAuthButton labelKey="login" />

        {DEV_LOGIN_ENABLED && (
          <form
            action={devFormAction}
            className="mt-4 flex flex-col gap-2 rounded-lg border border-dashed border-amber-500 p-3"
          >
            <p className="text-center text-xs font-medium text-amber-600 dark:text-amber-400">
              Mode démo — données 100% fictives, aucune session réelle
            </p>
            <div className="flex gap-2">
              <Button
                type="submit"
                name="role"
                value="athlete"
                variant="outline"
                disabled={isDevPending}
                className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              >
                {isDevPending ? "…" : "Démo Athlète"}
              </Button>
              <Button
                type="submit"
                name="role"
                value="recruiter"
                variant="outline"
                disabled={isDevPending}
                className="flex-1 border-amber-500 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              >
                {isDevPending ? "…" : "Démo Recruteur / Club"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("register")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
