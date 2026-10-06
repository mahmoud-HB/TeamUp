import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getDevSession } from "@/lib/dev-session";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import { AthleteDashboard } from "@/features/scouting/components/athlete-dashboard";
import { RecruiterDashboard } from "@/features/scouting/components/recruiter-dashboard";

export default async function HomePage() {
  const devSession = await getDevSession();

  if (devSession?.role === "recruiter") {
    return <RecruiterDashboard />;
  }

  if (devSession?.role === "athlete") {
    return <AthleteDashboard athlete={devSession.mockMe ?? MOCK_ATHLETES[0]} />;
  }

  // Session Supabase réelle (hors démo) : état vide actuel en attendant le
  // branchement des vraies données de profil.
  const t = await getTranslations("Common");
  const tProfile = await getTranslations("Profile.wizard");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm text-muted-foreground">{t("empty")}</p>
      <Button asChild>
        <Link href="/profile/edit">{tProfile("title")}</Link>
      </Button>
    </div>
  );
}
