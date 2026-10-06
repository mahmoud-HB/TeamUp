import { ProfileWizard } from "@/features/profile/components/profile-wizard";
import { getSportsWithPositions } from "@/features/profile/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function ProfileEditPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sports: Awaited<ReturnType<typeof getSportsWithPositions>> = [];
  let loadError = false;
  try {
    sports = await getSportsWithPositions();
  } catch {
    loadError = true;
  }

  if (loadError) {
    const t = await getTranslations("Common");
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <p className="text-sm text-destructive">{t("error")}</p>
      </div>
    );
  }

  if (sports.length === 0) {
    const t = await getTranslations("Common");
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <ProfileWizard
        sports={sports}
        defaultValues={
          user
            ? {
                username: user.user_metadata?.username ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
