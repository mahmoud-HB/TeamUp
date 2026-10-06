import { getTranslations } from "next-intl/server";

/**
 * Écran générique "à venir" pour les fonctionnalités des étapes
 * suivantes (recherche, messagerie, notifications) : affiche un état
 * vide explicite plutôt qu'une page blanche ou une 404.
 */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("Common");
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{t("empty")}</p>
    </div>
  );
}
