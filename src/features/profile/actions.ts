"use server";

import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createAthleteProfileSchema,
  type AthleteProfileInput,
} from "@/lib/validations/athlete-profile";

export type SaveProfileResult =
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Valide puis persiste le profil athlète complet (4 étapes du formulaire
 * guidé) : met à jour `profiles`, upsert `athlete_profiles`, remplace les
 * lignes `athlete_sports`. Toute la logique de sécurité repose sur les
 * politiques RLS (l'utilisateur ne peut écrire que sur son propre id).
 */
export async function saveAthleteProfileAction(
  input: AthleteProfileInput,
): Promise<SaveProfileResult> {
  const t = await getTranslations("Validation");
  const schema = createAthleteProfileSchema(t);
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    const tCommon = await getTranslations("Common");
    return { status: "error", message: tCommon("error"), fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const tCommon = await getTranslations("Common");
    return { status: "error", message: tCommon("error") };
  }

  const data = parsed.data;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: data.username,
      avatar_url: data.avatarUrl || null,
      bio: data.bio || null,
      country: data.country,
      birth_date: data.birthDate,
      visibility: data.visibility,
    })
    .eq("id", user.id);

  if (profileError) {
    return { status: "error", message: profileError.message };
  }

  const { error: athleteError } = await supabase
    .from("athlete_profiles")
    .upsert({
      id: user.id,
      availability_status: data.status,
      mobility: data.mobility,
    });

  if (athleteError) {
    return { status: "error", message: athleteError.message };
  }

  // Remplace l'intégralité des sports déclarés par la nouvelle liste
  // (plus simple et sûr qu'un diff fin pour un formulaire multi-étapes).
  const { error: deleteError } = await supabase
    .from("athlete_sports")
    .delete()
    .eq("athlete_id", user.id);

  if (deleteError) {
    return { status: "error", message: deleteError.message };
  }

  if (data.sports.length > 0) {
    const { error: sportsError } = await supabase.from("athlete_sports").insert(
      data.sports.map((sport) => ({
        athlete_id: user.id,
        sport_id: sport.sportId,
        position_id: sport.positionId || null,
        level: sport.level,
      })),
    );

    if (sportsError) {
      return { status: "error", message: sportsError.message };
    }
  }

  return { status: "success" };
}
