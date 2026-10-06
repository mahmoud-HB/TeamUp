import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Ruler, Weight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContactActions } from "@/features/scouting/components/contact-actions";
import { computeMockAge, findMockAthleteById } from "@/lib/mock/athletes";
import { getDevSession } from "@/lib/dev-session";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-professionnel",
  pro: "Professionnel",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  free: "Libre",
  under_contract: "Sous contrat",
  on_loan: "En prêt",
};

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const athlete = findMockAthleteById(id);
  if (!athlete) notFound();

  const devSession = await getDevSession();
  const role = devSession?.role ?? "athlete";
  const isOwnProfile = role === "athlete" && devSession?.mockMe.id === athlete.id;

  // Anti-fuite mineurs : même garde-fou que `searchMockAthletes`, appliqué
  // ici au cas où l'URL est atteinte directement.
  if (athlete.isMinor && role === "recruiter" && athlete.visibility !== "verified_only") {
    notFound();
  }

  const age = computeMockAge(athlete.birthDate);
  const initials = `${athlete.firstName[0]}${athlete.lastName[0]}`;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div
        className="h-28 w-full rounded-xl"
        style={{ backgroundColor: athlete.coverColor }}
        aria-hidden="true"
      />

      <div className="-mt-16 flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <Avatar className="size-24 border-4 border-background">
            <AvatarFallback className="text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">
                {athlete.firstName} {athlete.lastName}
              </h1>
              {athlete.verified && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  Vérifié
                </Badge>
              )}
              {isOwnProfile && <Badge variant="outline">Mon profil</Badge>}
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {athlete.countryFlag} {athlete.country} · {age} ans
            </p>
          </div>
        </div>

        {role === "recruiter" && !isOwnProfile && (
          <ContactActions athleteId={athlete.id} athleteName={athlete.firstName} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">À propos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{athlete.bio}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Ruler className="size-4 text-muted-foreground" aria-hidden="true" />
              {athlete.heightCm} cm
            </span>
            <span className="flex items-center gap-1.5">
              <Weight className="size-4 text-muted-foreground" aria-hidden="true" />
              {athlete.weightKg} kg
            </span>
            <span>
              Pied/main fort(e) :{" "}
              {athlete.dominantSide === "left"
                ? "Gauche"
                : athlete.dominantSide === "right"
                  ? "Droite"
                  : "Ambidextre"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{AVAILABILITY_LABELS[athlete.availability]}</Badge>
            {athlete.languages.map((lang) => (
              <Badge key={lang} variant="outline">
                {lang}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sports & postes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {athlete.sports.map((sport) => (
            <div key={sport.sportSlug} className="flex items-center justify-between">
              <div>
                <p className="font-medium capitalize">{sport.sportSlug}</p>
                <p className="text-sm text-muted-foreground">{sport.positionLabelFr}</p>
              </div>
              <Badge variant="outline">{LEVEL_LABELS[sport.level]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistiques</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {athlete.stats.length === 0 ? (
            <p className="text-sm text-muted-foreground">Non renseigné.</p>
          ) : (
            athlete.stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border p-3">
                <p className="text-lg font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Palmarès</CardTitle>
        </CardHeader>
        <CardContent>
          {athlete.palmares.length === 0 ? (
            <p className="text-sm text-muted-foreground">Non renseigné.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {athlete.palmares.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <span className="font-medium">{entry.season}</span> — {entry.title}{" "}
                  <span className="text-muted-foreground">({entry.competition})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parcours</CardTitle>
        </CardHeader>
        <CardContent>
          {athlete.career.length === 0 ? (
            <p className="text-sm text-muted-foreground">Non renseigné.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {athlete.career.map((entry, index) => (
                <li key={entry.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.club}</span>
                    <span className="text-muted-foreground">{entry.period}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {LEVEL_LABELS[entry.level]}
                  </span>
                  {index < athlete.career.length - 1 && <Separator className="mt-2" />}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
