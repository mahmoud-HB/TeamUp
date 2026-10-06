import { getDevSession } from "@/lib/dev-session";
import { AthleteSearch } from "@/features/scouting/components/athlete-search";
import { OffersList } from "@/features/scouting/components/offers-list";

export default async function SearchPage() {
  const devSession = await getDevSession();
  const role = devSession?.role ?? "athlete";

  if (role === "recruiter") {
    return <AthleteSearch />;
  }
  return <OffersList />;
}
