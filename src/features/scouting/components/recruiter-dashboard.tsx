import { Users, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AthleteCard } from "@/features/scouting/components/athlete-card";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import { searchMockAthletes } from "@/lib/mock/search";

/** Tableau de bord recruteur : accès rapide à la recherche + suggestions (démo). */
export function RecruiterDashboard() {
  const available = searchMockAthletes({});
  const suggested = available.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{available.length}</p>
              <p className="text-sm text-muted-foreground">Athlètes visibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <span className="flex size-10 items-center justify-center rounded-lg bg-success/15 text-success">
              <TrendingUp className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-semibold">
                {MOCK_ATHLETES.filter((a) => a.availability === "free").length}
              </p>
              <p className="text-sm text-muted-foreground">Disponibles immédiatement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Suggestions pour vous</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/search">Recherche avancée</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggested.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
