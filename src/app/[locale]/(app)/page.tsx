import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
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
