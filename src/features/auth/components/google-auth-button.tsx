"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signInWithGoogleAction } from "@/features/auth/actions";

export function GoogleAuthButton({
  labelKey,
}: {
  labelKey: "login" | "register";
}) {
  const t = useTranslations(`Auth.${labelKey}`);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await signInWithGoogleAction();
          if (result.status === "success") {
            window.location.href = result.url;
          }
        });
      }}
    >
      {t("withGoogle")}
    </Button>
  );
}
