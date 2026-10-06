import { BadgeCheck, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeMockAge } from "@/lib/mock/athletes";
import { MOCK_OFFERS } from "@/lib/mock/organizations";
import type { MockAthlete } from "@/lib/mock/types";

function computeCompletion(athlete: MockAthlete): number {
  const checks = [
    !!athlete.bio,
    !!athlete.avatarUrl,
    athlete.sports.length > 0,
    athlete.stats.length > 0,
    athlete.palmares.length > 0,
    athlete.career.length > 0,
    athlete.media.length > 0,
    athlete.languages.length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Tableau de bord athlète : aperçu du profil + offres récentes (démo). */
export function AthleteDashboard({ athlete }: { athlete: MockAthlete }) {
  const completion = computeCompletion(athlete);
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;
  const age = computeMockAge(athlete.birthDate);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={athlete.avatarUrl} alt="" />
              <AvatarFallback className="text-base font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {athlete.firstName} {athlete.lastName}
                </h1>
                {athlete.verified && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {athlete.sports[0]?.positionLabelFr} · {age} ans · {athlete.country}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={`/athletes/${athlete.id}`}>Voir mon profil public</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complétude du profil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Progress value={completion} />
          <p className="text-sm text-muted-foreground">
            {completion}% complété — un profil complet augmente vos chances d&apos;être
            repéré.
          </p>
          <Button asChild size="sm" className="w-fit">
            <Link href="/profile/edit">
              Compléter mon profil <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières offres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {MOCK_OFFERS.slice(0, 2).map((offer) => (
            <div key={offer.id} className="flex items-center justify-between text-sm">
              <span>{offer.title}</span>
              <span className="text-muted-foreground">{offer.location}</span>
            </div>
          ))}
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link href="/search">Voir toutes les offres</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
