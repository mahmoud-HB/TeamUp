"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Bouton de candidature factice (démo) : affiche une confirmation locale. */
export function ApplyButton({ offerTitle }: { offerTitle: string }) {
  return (
    <Button
      size="sm"
      className="w-fit"
      onClick={() =>
        toast.success(`Candidature envoyée pour "${offerTitle}" (démo).`)
      }
    >
      Candidater
    </Button>
  );
}
