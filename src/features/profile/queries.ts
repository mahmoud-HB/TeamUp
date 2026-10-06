import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SportOption = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  positions: { id: string; slug: string; nameFr: string; nameEn: string }[];
};

/**
 * Charge le référentiel sports + postes, utilisé par le formulaire guidé
 * de profil athlète. Données publiques (RLS : lecture ouverte à tous).
 */
export async function getSportsWithPositions(): Promise<SportOption[]> {
  const supabase = await createSupabaseServerClient();

  const [{ data: sports, error: sportsError }, { data: positions, error: positionsError }] =
    await Promise.all([
      supabase.from("sports").select("id, slug, name_fr, name_en").order("name_fr"),
      supabase
        .from("positions")
        .select("id, slug, name_fr, name_en, sport_id")
        .order("name_fr"),
    ]);

  if (sportsError || positionsError) {
    throw new Error(
      sportsError?.message ?? positionsError?.message ?? "Unknown error",
    );
  }

  return (sports ?? []).map((sport) => ({
    id: sport.id,
    slug: sport.slug,
    nameFr: sport.name_fr,
    nameEn: sport.name_en,
    positions: (positions ?? [])
      .filter((position) => position.sport_id === sport.id)
      .map((position) => ({
        id: position.id,
        slug: position.slug,
        nameFr: position.name_fr,
        nameEn: position.name_en,
      })),
  }));
}
