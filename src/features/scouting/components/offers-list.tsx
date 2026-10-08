"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyButton } from "@/features/scouting/components/apply-button";
import { organizationService, type Offer } from "@/lib/services/organization-service";
import { Loader2 } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-pro",
  pro: "Professionnel",
};

/**
 * Liste des offres de détection : bascule automatique mock ↔ Supabase.
 * Données de démonstration ou réelles selon NEXT_PUBLIC_DEMO_MODE.
 */
export function OffersList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      const result = await organizationService.listOffers();
      if (result.ok) {
        setOffers(result.data);
      }
      setLoading(false);
    }
    loadOffers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Offres de détection</h1>
        <p className="text-sm text-muted-foreground">
          Offres publiées par des clubs et recruteurs.
        </p>
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune offre pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {offer.organizationId} · {offer.location}
                  </p>
                </div>
                <Badge variant="outline">{LEVEL_LABELS[offer.level]}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {offer.description || "Pas de description"}
                </p>
                <ApplyButton offerTitle={offer.title} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
