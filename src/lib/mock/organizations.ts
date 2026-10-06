import type { MockOffer, MockRecruiterOrg } from "./types";

export const MOCK_ORGS: MockRecruiterOrg[] = [
  {
    id: "org-001",
    name: "AS Montverde",
    type: "club",
    country: "France",
    verified: true,
    logoColor: "oklch(0.72 0.14 165)",
    description: "Club de football évoluant en D2 régionale, centre de formation reconnu.",
  },
  {
    id: "org-002",
    name: "Scout Partners Europe",
    type: "recruiter",
    country: "Belgique",
    verified: true,
    logoColor: "oklch(0.68 0.16 220)",
    description: "Agence de recrutement sportif spécialisée en football et basketball.",
  },
  {
    id: "org-003",
    name: "Hamburg Towers",
    type: "club",
    country: "Allemagne",
    verified: true,
    logoColor: "oklch(0.60 0.13 260)",
    description: "Club de basketball professionnel, section réserve et formation.",
  },
];

export const MOCK_OFFERS: MockOffer[] = [
  {
    id: "off-001",
    orgId: "org-001",
    title: "Défenseur(se) central(e) pour la saison à venir",
    sportSlug: "football",
    positionLabelFr: "Défenseur central",
    level: "semi_pro",
    location: "France",
    description: "Recherche profil gaucher, disponible immédiatement, expérience D2 appréciée.",
  },
  {
    id: "off-002",
    orgId: "org-003",
    title: "Arrière polyvalent pour équipe réserve",
    sportSlug: "basketball",
    positionLabelFr: "Arrière",
    level: "semi_pro",
    location: "Allemagne",
    description: "Joueur endurant, bon défenseur, intégration immédiate.",
  },
];

export function findMockOrgById(id: string): MockRecruiterOrg | undefined {
  return MOCK_ORGS.find((org) => org.id === id);
}
