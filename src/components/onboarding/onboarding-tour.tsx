"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DevRole } from "@/lib/dev-auth";

type Step = { title: string; description: string };

const ATHLETE_STEPS: Step[] = [
  {
    title: "Bienvenue sur Scoutly 👋",
    description:
      "Complétez votre profil (bio, pays, plateformes, sports avec rang et rôle) pour être visible par les recruteurs vérifiés.",
  },
  {
    title: "Vos statistiques et votre palmarès",
    description:
      "Ajoutez vos stats, votre palmarès et votre parcours chronologique : plus votre profil est complet, plus l'analyse des recruteurs sera précise.",
  },
  {
    title: "Offres et demandes de contact",
    description:
      "Consultez les offres publiées par les clubs dans l'onglet « Offres » et répondez aux demandes de contact des recruteurs vérifiés.",
  },
];

const RECRUITER_STEPS: Step[] = [
  {
    title: "Bienvenue sur Scoutly 👋",
    description:
      "Recherchez des athlètes avec des filtres précis (sport, niveau, disponibilité...) depuis l'onglet « Rechercher ».",
  },
  {
    title: "Fiches athlètes complètes",
    description:
      "Chaque fiche présente le profil, les statistiques, le palmarès et le parcours — uniquement des données vérifiables, jamais inventées.",
  },
  {
    title: "Favoris et demandes de contact",
    description:
      "Ajoutez des profils en favoris et lancez une demande de contact directement depuis la fiche de l'athlète.",
  },
];

function storageKey(role: DevRole) {
  return `scoutly-onboarding-seen:${role}`;
}

/**
 * Tutoriel léger affiché une seule fois par rôle à la première connexion
 * (flag dans localStorage). Contenu adapté selon le rôle (athlète/recruteur).
 */
export function OnboardingTour({ role }: { role: DevRole }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const steps = role === "recruiter" ? RECRUITER_STEPS : ATHLETE_STEPS;

  useEffect(() => {
    // Lecture localStorage : ne peut se faire qu'après le montage côté
    // client, pour éviter toute divergence de rendu serveur/client (SSR).
    const seen = window.localStorage.getItem(storageKey(role));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation nécessaire avec localStorage (indisponible en SSR)
    if (!seen) setOpen(true);
  }, [role]);

  function close() {
    window.localStorage.setItem(storageKey(role), "1");
    setOpen(false);
    setStepIndex(0);
  }

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-1.5 py-2">
          {steps.map((s, i) => (
            <span
              key={s.title}
              aria-hidden="true"
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i === stepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={close}>
            Passer
          </Button>
          <Button
            size="sm"
            onClick={() => (isLast ? close() : setStepIndex((i) => i + 1))}
          >
            {isLast ? "Terminer" : "Suivant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
