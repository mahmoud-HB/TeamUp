import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyButton } from "@/features/scouting/components/apply-button";
import { MOCK_OFFERS } from "@/lib/mock/organizations";
import { findMockOrgById } from "@/lib/mock/organizations";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-pro",
  pro: "Professionnel",
};

/**
 * Liste des offres de détection pour les athlètes, sur données fictives.
 * Préfigure la future page "Clubs / organisations" du cahier des charges.
 */
export function OffersList() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Offres de détection</h1>
        <p className="text-sm text-muted-foreground">
          Offres publiées par des clubs et recruteurs — données de démonstration.
        </p>
      </div>

      {MOCK_OFFERS.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune offre pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {MOCK_OFFERS.map((offer) => {
            const org = findMockOrgById(offer.orgId);
            return (
              <Card key={offer.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {org?.name} · {offer.location}
                    </p>
                  </div>
                  <Badge variant="outline">{LEVEL_LABELS[offer.level]}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    {offer.description}
                  </p>
                  <ApplyButton offerTitle={offer.title} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
