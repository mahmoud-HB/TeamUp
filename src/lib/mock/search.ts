import type { AvailabilityStatus, SportLevel } from "@/lib/validations/athlete-profile";
import { computeMockAge, MOCK_ATHLETES } from "./athletes";
import type { MockAthlete } from "./types";

export type AthleteSearchFilters = {
  query?: string;
  sportSlug?: string;
  level?: SportLevel;
  availability?: AvailabilityStatus;
  minAge?: number;
  maxAge?: number;
  countries?: string[];
};

/**
 * Filtre côté client sur le jeu de données fictives, pour prévisualiser
 * l'UI de recherche recruteur. Reproduit (en simplifié) la logique prévue
 * pour la vraie couche de recherche Supabase (section "Recherche &
 * filtres" du cahier des charges) : exclusion systématique des profils
 * mineurs et des profils privés, qui ne doivent jamais apparaître dans les
 * résultats de recherche recruteur.
 */
export function searchMockAthletes(
  filters: AthleteSearchFilters,
  athletes: MockAthlete[] = MOCK_ATHLETES,
): MockAthlete[] {
  const query = filters.query?.trim().toLowerCase();

  return athletes.filter((athlete) => {
    // Règle de protection des mineurs : jamais exposés à la recherche.
    if (athlete.isMinor) return false;
    // Les profils privés ne sont jamais retournés par la recherche.
    if (athlete.visibility === "private") return false;

    if (
      filters.sportSlug &&
      !athlete.sports.some((sport) => sport.sportSlug === filters.sportSlug)
    ) {
      return false;
    }

    if (
      filters.level &&
      !athlete.sports.some((sport) => sport.level === filters.level)
    ) {
      return false;
    }

    if (filters.availability && athlete.availability !== filters.availability) {
      return false;
    }

    const age = computeMockAge(athlete.birthDate);
    if (filters.minAge !== undefined && age < filters.minAge) return false;
    if (filters.maxAge !== undefined && age > filters.maxAge) return false;

    if (
      filters.countries &&
      filters.countries.length > 0 &&
      !filters.countries.includes(athlete.country)
    ) {
      return false;
    }

    if (query) {
      const haystack =
        `${athlete.firstName} ${athlete.lastName} ${athlete.username} ${athlete.currentClub} ${athlete.bio}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}
