"use client";

import { useEffect, useState } from "react";
import { Heart, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FAVORITES_KEY = "scoutly-demo-favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Actions recruteur sur une fiche athlète : favoris (persistés en
 * localStorage, démo uniquement) et demande de contact (stub avec toast).
 * Reproduit le flux "demande de contact" du cahier des charges sans backend.
 */
export function ContactActions({
  athleteId,
  athleteName,
}: {
  athleteId: string;
  athleteName: string;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Lecture localStorage : ne peut se faire qu'après le montage côté
    // client, pour éviter toute divergence de rendu serveur/client (SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation nécessaire avec localStorage (indisponible en SSR)
    setIsFavorite(readFavorites().includes(athleteId));
  }, [athleteId]);

  function toggleFavorite() {
    const favorites = readFavorites();
    const next = favorites.includes(athleteId)
      ? favorites.filter((id) => id !== athleteId)
      : [...favorites, athleteId];
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setIsFavorite(next.includes(athleteId));
    toast.success(
      next.includes(athleteId)
        ? `${athleteName} ajouté(e) aux favoris.`
        : `${athleteName} retiré(e) des favoris.`,
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={toggleFavorite}>
        <Heart className="size-4" aria-hidden="true" />
        {isFavorite ? "Favori" : "Ajouter aux favoris"}
      </Button>
      <Button
        size="sm"
        onClick={() =>
          toast.success(`Demande de contact envoyée à ${athleteName} (démo).`)
        }
      >
        <Mail className="size-4" aria-hidden="true" />
        Contacter
      </Button>
    </div>
  );
}
