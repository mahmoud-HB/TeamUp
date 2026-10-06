import { BadgeCheck, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeMockAge } from "@/lib/mock/athletes";
import type { MockAthlete } from "@/lib/mock/types";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-pro",
  pro: "Professionnel",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  free: "Libre",
  under_contract: "Sous contrat",
  on_loan: "En prêt",
};

/**
 * Carte athlète compacte utilisée dans les résultats de recherche
 * recruteur et les suggestions du tableau de bord. Les données proviennent
 * exclusivement du jeu de données fictives (`lib/mock`) : aucune donnée
 * réelle n'est inventée ni affichée ici.
 */
export function AthleteCard({ athlete }: { athlete: MockAthlete }) {
  const mainSport = athlete.sports[0];
  const age = computeMockAge(athlete.birthDate);
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-primary/20">
      <div
        className="relative h-16 w-full"
        style={{
          backgroundImage: `linear-gradient(135deg, ${athlete.coverColor}, color-mix(in oklch, ${athlete.coverColor}, black 25%))`,
        }}
        aria-hidden="true"
      />
      <CardContent className="-mt-8 flex flex-col gap-3 pt-0">
        <div className="flex items-end justify-between">
          <Avatar className="size-16 border-4 border-card">
            <AvatarImage src={athlete.avatarUrl} alt="" />
            <AvatarFallback className="text-base font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {athlete.verified && (
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary"
            >
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Vérifié
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
            {athlete.firstName} {athlete.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mainSport?.positionLabelFr ?? "—"} · {age} ans
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" />
            {athlete.countryFlag} {athlete.country}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {mainSport && (
            <Badge variant="outline">{LEVEL_LABELS[mainSport.level]}</Badge>
          )}
          <Badge variant="outline">{AVAILABILITY_LABELS[athlete.availability]}</Badge>
        </div>

        <Button asChild size="sm" className="mt-1">
          <Link href={`/athletes/${athlete.id}`}>Voir le profil</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
