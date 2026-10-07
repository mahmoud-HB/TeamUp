import type { MockOffer, MockRecruiterOrg } from "./types";

/**
 * Jeu de données fictives (aucune organisation réelle) : clubs et agences
 * de recrutement utilisés uniquement en mode démo. Les logos utilisent un
 * générateur d'avatars à base d'initiales (dicebear), jamais de vrais
 * logos de club.
 */
export const MOCK_ORGS: MockRecruiterOrg[] = [
  {
    id: "org-001",
    name: "AS Montverde",
    type: "club",
    country: "France",
    verified: true,
    logoColor: "oklch(0.72 0.14 165)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=AS%20Montverde&backgroundType=gradientLinear",
    description: "Club de football évoluant en D2 régionale, centre de formation reconnu.",
  },
  {
    id: "org-002",
    name: "Scout Partners Europe",
    type: "recruiter",
    country: "Belgique",
    verified: true,
    logoColor: "oklch(0.68 0.16 220)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Scout%20Partners&backgroundType=gradientLinear",
    description: "Agence de recrutement sportif spécialisée en football et basketball.",
  },
  {
    id: "org-003",
    name: "Hamburg Towers",
    type: "club",
    country: "Allemagne",
    verified: true,
    logoColor: "oklch(0.60 0.13 260)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Hamburg%20Towers&backgroundType=gradientLinear",
    description: "Club de basketball professionnel, section réserve et formation.",
  },
  {
    id: "org-004",
    name: "IK Sävehof Handboll",
    type: "club",
    country: "Suède",
    verified: true,
    logoColor: "oklch(0.70 0.15 210)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=IK%20Savehof&backgroundType=gradientLinear",
    description: "Club de handball d'élite suédois, formation et équipe première.",
  },
  {
    id: "org-005",
    name: "Talento Global Agency",
    type: "recruiter",
    country: "Espagne",
    verified: true,
    logoColor: "oklch(0.68 0.19 25)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Talento%20Global&backgroundType=gradientLinear",
    description: "Cabinet de scouting multi-sports (handball, tennis, athlétisme) en Europe du Sud.",
  },
  {
    id: "org-006",
    name: "Volley Torino",
    type: "club",
    country: "Italie",
    verified: false,
    logoColor: "oklch(0.74 0.15 95)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Volley%20Torino&backgroundType=gradientLinear",
    description: "Club de volleyball italien évoluant en Serie A2.",
  },
  {
    id: "org-007",
    name: "Nordic Endurance Sports",
    type: "recruiter",
    country: "Pays-Bas",
    verified: true,
    logoColor: "oklch(0.62 0.15 230)",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Nordic%20Endurance&backgroundType=gradientLinear",
    description: "Agence spécialisée dans le repérage de talents en sports d'endurance (natation, cyclisme, athlétisme).",
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
    createdAt: "2024-06-02",
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
    createdAt: "2024-05-28",
  },
  {
    id: "off-003",
    orgId: "org-002",
    title: "Ailier offensif pour club partenaire en Belgique",
    sportSlug: "football",
    positionLabelFr: "Ailier",
    level: "amateur",
    location: "Belgique",
    description: "Mission de placement pour un club partenaire : ailier rapide, bon 1v1.",
    createdAt: "2024-06-10",
  },
  {
    id: "off-004",
    orgId: "org-004",
    title: "Gardienne de but confirmée — équipe première",
    sportSlug: "handball",
    positionLabelFr: "Gardienne de but",
    level: "pro",
    location: "Suède",
    description: "Remplacement d'une titulaire blessée, contrat courte durée renouvelable.",
    createdAt: "2024-06-14",
  },
  {
    id: "off-005",
    orgId: "org-005",
    title: "Pivot de handball pour club en D2 espagnole",
    sportSlug: "handball",
    positionLabelFr: "Pivot",
    level: "semi_pro",
    location: "Espagne",
    description: "Recherche pivot puissant, bon dans le jeu de transition.",
    createdAt: "2024-05-20",
  },
  {
    id: "off-006",
    orgId: "org-006",
    title: "Réceptionneuse-attaquante pour renfort d'effectif",
    sportSlug: "volleyball",
    positionLabelFr: "Réceptionneuse-attaquante",
    level: "semi_pro",
    location: "Italie",
    description: "Recherche joueuse combative, disponible pour la fin de saison.",
    createdAt: "2024-06-05",
  },
  {
    id: "off-007",
    orgId: "org-007",
    title: "Cycliste grimpeur pour saison UCI continentale",
    sportSlug: "cyclisme",
    positionLabelFr: "Grimpeur",
    level: "semi_pro",
    location: "Pays-Bas",
    description: "Recherche profil endurant, bon ratio poids/puissance, disponible pour un contrat saisonnier.",
    createdAt: "2024-06-16",
  },
];

export function findMockOrgById(id: string): MockRecruiterOrg | undefined {
  return MOCK_ORGS.find((org) => org.id === id);
}

export function findMockOfferById(id: string): MockOffer | undefined {
  return MOCK_OFFERS.find((offer) => offer.id === id);
}
