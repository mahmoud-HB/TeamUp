import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/layout/coming-soon";

export default async function MessagesPage() {
  const t = await getTranslations("Nav");
  return <ComingSoon title={t("messages")} />;
}
