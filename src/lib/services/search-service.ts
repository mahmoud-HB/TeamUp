/**
 * SearchService: recherche avancée d'athlètes avec filtres
 * Bascule automatique mock ↔ Supabase via NEXT_PUBLIC_DEMO_MODE
 */

import { ServiceResult, ok, err, isDemoMode } from "./index";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import type { MockAthlete } from "@/lib/mock/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface SearchFilters {
  query?: string; // Texte libre: nom, username, bio
  sports?: string[]; // slugs: football, basketball, tennis, etc.
  countries?: string[]; // codes ISO: FR, DE, ES, etc.
  levels?: ("beginner" | "amateur" | "semi_pro" | "pro")[]; // Niveaux
  positions?: string[]; // Postes: Attaquant, Ailier, etc.
  availability?: "free" | "under_contract" | "on_loan"; // Disponibilité
  sortBy?: "name" | "compatibility" | "recent"; // Tri
}

export interface SearchResult {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  country: string;
  countryFlag?: string;
  bio: string;
  sports: Array<{
    sportSlug: string;
    positionLabelFr: string;
    positionLabelEn: string;
    level: string;
  }>;
  availability: string;
  verified: boolean;
  currentClub?: string;
  compatibilityScore?: number; // 0-100: how well matches filters
}

// ============ DEMO MODE IMPLEMENTATION ============

function scoreMockAthlete(athlete: MockAthlete, filters: SearchFilters): number {
  let score = 100;

  // Déductions si critères pas matchés
  if (filters.sports && filters.sports.length > 0) {
    const hasSport = athlete.sports.some((s: any) => filters.sports!.includes(s.sportSlug));
    if (!hasSport) score -= 40;
  }

  if (filters.countries && filters.countries.length > 0) {
    if (!filters.countries.includes(athlete.country)) score -= 30;
  }

  if (filters.levels && filters.levels.length > 0) {
    const hasLevel = athlete.sports.some((s) => filters.levels!.includes(s.level as any));
    if (!hasLevel) score -= 25;
  }

  if (filters.positions && filters.positions.length > 0) {
    const hasPosition = athlete.sports.some((s) =>
      filters.positions!.some(
        (p) => p.toLowerCase() === s.positionLabelFr.toLowerCase()
      )
    );
    if (!hasPosition) score -= 20;
  }

  if (filters.availability && athlete.availability !== filters.availability) {
    score -= 10;
  }

  // Recherche texte (nom, username, bio)
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
    const username = athlete.username.toLowerCase();
    const bio = athlete.bio.toLowerCase();

    const matches =
      fullName.includes(q) || username.includes(q) || bio.includes(q);

    if (!matches) score = 0;
  }

  return Math.max(0, score);
}

function filterMockAthletes(
  athletes: MockAthlete[],
  filters: SearchFilters
): SearchResult[] {
  return athletes
    .map((athlete) => {
      const compatibilityScore = scoreMockAthlete(athlete, filters);
      return {
        id: athlete.id,
        username: athlete.username,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        avatarUrl: athlete.avatarUrl,
        country: athlete.country,
        countryFlag: athlete.countryFlag,
        bio: athlete.bio,
        sports: athlete.sports,
        availability: athlete.availability,
        verified: athlete.verified,
        currentClub: athlete.currentClub,
        compatibilityScore,
      };
    })
    .filter((result) => result.compatibilityScore > 0)
    .sort((a, b) => {
      if (filters.sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      }
      if (filters.sortBy === "recent") {
        return 0; // Would need created_at field
      }
      // Default: compatibility
      return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
    });
}

// ============ REAL MODE (Supabase) ============

async function searchSupabaseAthletes(
  filters: SearchFilters,
  limit = 20,
  offset = 0
): Promise<SearchResult[]> {
  const supabase = createSupabaseBrowserClient();

  // Build query
  let query = supabase
    .from("athletes")
    .select(
      `id, username, first_name, last_name, avatar_url, country, bio,
       availability, verified, current_club, 
       athlete_sports(sport_slug, position_label_fr, position_label_en, level)`
    );

  // Apply filters
  if (filters.query) {
    query = query.or(
      `username.ilike.%${filters.query}%,first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`
    );
  }

  if (filters.countries && filters.countries.length > 0) {
    query = query.in("country", filters.countries);
  }

  if (filters.availability) {
    query = query.eq("availability", filters.availability);
  }

  // Apply limit/offset
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase search error:", error);
    return [];
  }

  // Post-process for sports/levels/positions (filtered in JS due to JOIN complexity)
  return (data || [])
    .map((row: any) => ({
      id: row.id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      country: row.country,
      bio: row.bio,
      sports: row.athlete_sports || [],
      availability: row.availability,
      verified: row.verified,
      currentClub: row.current_club,
    }))
    .filter((result) => {
      if (filters.sports && filters.sports.length > 0) {
        return result.sports.some((s: any) => filters.sports!.includes(s.sport_slug));
      }
      if (filters.levels && filters.levels.length > 0) {
        return result.sports.some((s: any) => filters.levels!.includes(s.level));
      }
      if (filters.positions && filters.positions.length > 0) {
        return result.sports.some((s: any) =>
          filters.positions!.some(
            (p) => p.toLowerCase() === s.position_label_fr.toLowerCase()
          )
        );
      }
      return true;
    });
}

// ============ PUBLIC API ============

export class SearchService {
  /**
   * Recherche athlètes avec filtres avancés
   */
  static async searchAthletes(
    filters: SearchFilters,
    limit = 20,
    offset = 0
  ): Promise<ServiceResult<SearchResult[]>> {
    try {
      if (isDemoMode()) {
        const results = filterMockAthletes(MOCK_ATHLETES, filters).slice(
          offset,
          offset + limit
        );
        return ok(results);
      }

      const results = await searchSupabaseAthletes(filters, limit, offset);
      return ok(results);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to search athletes",
        "SEARCH_ERROR"
      );
    }
  }

  /**
   * Récupère tous les sports disponibles (pour le dropdown)
   */
  static async getAvailableSports(): Promise<ServiceResult<string[]>> {
    try {
      if (isDemoMode()) {
        const sports = Array.from(
          new Set(MOCK_ATHLETES.flatMap((a) => a.sports.map((s: any) => s.sportSlug)))
        );
        return ok(sports.sort());
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("sports")
        .select("slug")
        .order("slug");

      if (error) {
        return err(error.message, "GET_SPORTS_ERROR");
      }

      return ok((data || []).map((s: any) => s.slug));
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get sports",
        "GET_SPORTS_ERROR"
      );
    }
  }

  /**
   * Récupère tous les pays disponibles
   */
  static async getAvailableCountries(): Promise<ServiceResult<string[]>> {
    try {
      if (isDemoMode()) {
        const countries = Array.from(
          new Set(MOCK_ATHLETES.map((a) => a.country))
        );
        return ok(countries.sort());
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("athletes")
        .select("country")
        .order("country");

      if (error) {
        return err(error.message, "GET_COUNTRIES_ERROR");
      }

      const countries = Array.from(
        new Set((data || []).map((a: any) => a.country))
      );
      return ok(countries.sort());
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get countries",
        "GET_COUNTRIES_ERROR"
      );
    }
  }

  /**
   * Récupère toutes les positions pour un sport (optionnel: filtrer par sport)
   */
  static async getAvailablePositions(
    sport?: string
  ): Promise<ServiceResult<string[]>> {
    try {
      if (isDemoMode()) {
        let positions = MOCK_ATHLETES.flatMap((a) =>
          a.sports
            .filter((s) => !sport || s.sportSlug === sport)
            .map((s) => s.positionLabelFr)
        );
        positions = Array.from(new Set(positions));
        return ok(positions.sort());
      }

      // In real mode, would query athlete_sports table
      return ok([]);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get positions",
        "GET_POSITIONS_ERROR"
      );
    }
  }

  /**
   * Récupère toutes les positions pour tous les sports
   */
  static async getAllPositions(): Promise<ServiceResult<string[]>> {
    return this.getAvailablePositions();
  }
}
