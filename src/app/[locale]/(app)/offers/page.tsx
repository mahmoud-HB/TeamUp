import { OffersService } from '@/lib/services/offers-service';

export default async function OffersPage() {
  const result = await OffersService.listOffers();
  const offers = result.ok ? result.data : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold">Offres de recrutement</h1>
        <p className="text-muted-foreground">Découvrez les meilleures opportunités</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border p-4">
            <h3 className="font-semibold">{offer.title}</h3>
            <p className="text-xs text-muted-foreground">{offer.sport} • {offer.level}</p>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{offer.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">{offer.applicant_count} candidats</p>
          </div>
        ))}
      </div>
    </div>
  );
}
