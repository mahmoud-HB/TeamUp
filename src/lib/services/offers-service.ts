/**
 * OffersService: gestion des offres de recrutement
 * Mode démo uniquement pour MVP
 */

import { ServiceResult, ok, err } from "./index";

export interface Offer {
  id: string;
  title: string;
  description: string;
  sport: string;
  country: string;
  level: string;
  team_id: string;
  applicant_count: number;
  created_at: string;
}

const MOCK_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    title: 'Football Striker - U21',
    description: 'We are looking for talented football strikers under 21',
    sport: 'Football',
    country: 'GB',
    level: 'Advanced',
    team_id: 'team-1',
    applicant_count: 5,
    created_at: new Date('2024-09-01').toISOString(),
  },
  {
    id: 'offer-2',
    title: 'Basketball Guard - All Ages',
    description: 'Top recruitment offer for basketball guards',
    sport: 'Basketball',
    country: 'FR',
    level: 'Professional',
    team_id: 'team-2',
    applicant_count: 12,
    created_at: new Date('2024-09-05').toISOString(),
  },
];

export const OffersService = {
  async listOffers(): Promise<ServiceResult<Offer[]>> {
    return ok(MOCK_OFFERS);
  },

  async getOffer(offerId: string): Promise<ServiceResult<Offer>> {
    const offer = MOCK_OFFERS.find((o) => o.id === offerId);
    return offer ? ok(offer) : err('Offer not found');
  },

  async createOffer(input: Partial<Offer>): Promise<ServiceResult<Offer>> {
    const offer: Offer = {
      id: `offer-${Date.now()}`,
      title: input.title || 'Untitled',
      description: input.description || '',
      sport: input.sport || '',
      country: input.country || '',
      level: input.level || '',
      team_id: input.team_id || '',
      applicant_count: 0,
      created_at: new Date().toISOString(),
    };
    MOCK_OFFERS.push(offer);
    return ok(offer);
  },

  async applyToOffer(offerId: string): Promise<ServiceResult<{ success: boolean }>> {
    const offer = MOCK_OFFERS.find((o) => o.id === offerId);
    if (!offer) return err('Offer not found');
    offer.applicant_count += 1;
    return ok({ success: true });
  },
};
