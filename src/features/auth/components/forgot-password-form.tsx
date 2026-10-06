"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  forgotPasswordAction,
  type AuthActionState,
} from "@/features/auth/actions";

const INITIAL_STATE: AuthActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const t = useTranslations("Auth.forgotPassword");
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    INITIAL_STATE,
  );

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

            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "…" : t("submit")}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
