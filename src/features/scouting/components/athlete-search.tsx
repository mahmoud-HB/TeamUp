"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AthleteCard } from "@/features/scouting/components/athlete-card";
import { searchMockAthletes } from "@/lib/mock/search";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import type { AvailabilityStatus, SportLevel } from "@/lib/validations/athlete-profile";

const SPORT_OPTIONS = [
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "rugby", label: "Rugby" },
  { value: "volleyball", label: "Volleyball" },
  { value: "handball", label: "Handball" },
  { value: "tennis", label: "Tennis" },
  { value: "athletisme", label: "Athlétisme" },
  { value: "natation", label: "Natation" },
  { value: "cyclisme", label: "Cyclisme" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Débutant" },
  { value: "amateur", label: "Amateur" },
  { value: "semi_pro", label: "Semi-professionnel" },
  { value: "pro", label: "Professionnel" },
];

const AVAILABILITY_OPTIONS = [
  { value: "free", label: "Libre" },
  { value: "under_contract", label: "Sous contrat" },
  { value: "on_loan", label: "En prêt" },
];

const ANY_VALUE = "any";

/**
 * Recherche recruteur sur le jeu de données fictives. Préfigure l'UI de la
 * vraie recherche Supabase (filtres identiques prévus au cahier des
 * charges) : sport, niveau, disponibilité, texte libre. Exclut toujours les
 * profils mineurs et privés (voir `lib/mock/search.ts`).
 */
export function AthleteSearch() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<string>(ANY_VALUE);
  const [level, setLevel] = useState<string>(ANY_VALUE);
  const [availability, setAvailability] = useState<string>(ANY_VALUE);

  const results = useMemo(
    () =>
      searchMockAthletes({
        query: query || undefined,
        sportSlug: sport === ANY_VALUE ? undefined : sport,
        level: level === ANY_VALUE ? undefined : (level as SportLevel),
        availability:
          availability === ANY_VALUE
            ? undefined
            : (availability as AvailabilityStatus),
      }),
    [query, sport, level, availability],
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Rechercher des athlètes</h1>
        <p className="text-sm text-muted-foreground">
          {MOCK_ATHLETES.length} profils de démonstration disponibles —
          données 100% fictives.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtres
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="search-query">Recherche libre</Label>
            <div className="relative">
              <SearchIcon
                className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="search-query"
                placeholder="Nom, club, mots-clés..."
                className="pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sport</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Tous les sports</SelectItem>
                {SPORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Niveau</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Tous niveaux</SelectItem>
                {LEVEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Disponibilité</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Toutes</SelectItem>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(sport !== ANY_VALUE || level !== ANY_VALUE || availability !== ANY_VALUE || query) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => {
              setQuery("");
              setSport(ANY_VALUE);
              setLevel(ANY_VALUE);
              setAvailability(ANY_VALUE);
            }}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-medium">Aucun athlète ne correspond à ces critères.</p>
          <p className="text-sm text-muted-foreground">
            Essayez d&apos;assouplir un filtre (niveau, disponibilité, sport...).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </div>
  );
}
