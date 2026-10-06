import { findMockAthleteById } from "./athletes";
import { findMockOfferById, findMockOrgById } from "./organizations";

export type FeedAuthorType = "athlete" | "organization";
export type FeedPostKind = "photo" | "achievement" | "job" | "text";

export type MockFeedPost = {
  id: string;
  authorType: FeedAuthorType;
  authorId: string;
  kind: FeedPostKind;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  offerId?: string;
};

/**
 * Fil d'actualité fictif façon réseau professionnel : photos d'entraînement
 * publiées par des athlètes, annonces de palmarès, et offres de
 * recrutement publiées par des clubs/agences. 100% de données factices,
 * réutilisées depuis `mock/athletes.ts` et `mock/organizations.ts`
 * (aucune duplication de logique de recherche/scoring).
 */
export const MOCK_FEED_POSTS: MockFeedPost[] = [
  {
    id: "post-001",
    authorType: "athlete",
    authorId: "ath-001",
    kind: "photo",
    content: "Belle séance de travail sur la relance de balle ce matin. Prête pour la reprise ! 💪",
    imageUrl: "https://picsum.photos/seed/lea-martins-2/900/600",
    createdAt: "2024-06-15T08:30:00.000Z",
    likes: 42,
    comments: 6,
  },
  {
    id: "post-002",
    authorType: "organization",
    authorId: "org-004",
    kind: "job",
    content: "Nous recherchons une gardienne de but confirmée pour renforcer l'équipe première dès que possible.",
    createdAt: "2024-06-14T10:00:00.000Z",
    likes: 18,
    comments: 3,
    offerId: "off-004",
  },
  {
    id: "post-003",
    authorType: "athlete",
    authorId: "ath-003",
    kind: "achievement",
    content: "Fière d'avoir contribué à la vice-victoire en championnat national cette saison. Merci à toute l'équipe 🏀",
    imageUrl: "https://picsum.photos/seed/amara-diallo-1/900/600",
    createdAt: "2024-06-12T18:15:00.000Z",
    likes: 67,
    comments: 11,
  },
  {
    id: "post-004",
    authorType: "organization",
    authorId: "org-002",
    kind: "job",
    content: "Nouvelle mission de placement : ailier offensif pour un club partenaire en Belgique. Profils rapides et percutants bienvenus.",
    createdAt: "2024-06-10T09:00:00.000Z",
    likes: 9,
    comments: 2,
    offerId: "off-003",
  },
  {
    id: "post-005",
    authorType: "athlete",
    authorId: "ath-005",
    kind: "photo",
    content: "Retour au top niveau après une préparation intense cet été. On garde la combativité 🔥",
    imageUrl: "https://picsum.photos/seed/chiara-rossi-1/900/600",
    createdAt: "2024-06-09T14:45:00.000Z",
    likes: 29,
    comments: 4,
  },
  {
    id: "post-006",
    authorType: "athlete",
    authorId: "ath-009",
    kind: "achievement",
    content: "Championnes de Suède ! Un énorme travail d'équipe depuis le début de saison 🏆",
    imageUrl: "https://picsum.photos/seed/sara-lindqvist-1/900/600",
    createdAt: "2024-06-07T20:00:00.000Z",
    likes: 94,
    comments: 15,
  },
  {
    id: "post-007",
    authorType: "organization",
    authorId: "org-006",
    kind: "job",
    content: "Besoin d'une réceptionneuse-attaquante pour terminer la saison en Serie A2. Disponibilité immédiate requise.",
    createdAt: "2024-06-05T11:30:00.000Z",
    likes: 7,
    comments: 1,
    offerId: "off-006",
  },
  {
    id: "post-008",
    authorType: "athlete",
    authorId: "ath-011",
    kind: "photo",
    content: "Belle victoire en 3 sets ce week-end. Le travail paye petit à petit 🎾",
    imageUrl: "https://picsum.photos/seed/julia-kowalski-1/900/600",
    createdAt: "2024-06-03T16:20:00.000Z",
    likes: 21,
    comments: 3,
  },
  {
    id: "post-009",
    authorType: "organization",
    authorId: "org-001",
    kind: "job",
    content: "Notre club de D2 régionale recherche un défenseur central gaucher pour la saison à venir.",
    createdAt: "2024-06-02T08:00:00.000Z",
    likes: 14,
    comments: 2,
    offerId: "off-001",
  },
  {
    id: "post-010",
    authorType: "athlete",
    authorId: "ath-012",
    kind: "photo",
    content: "Nouveau record personnel sur 100m ce week-end : 10.41s. Objectif : encore descendre 🏃",
    imageUrl: "https://picsum.photos/seed/kevin-otieno-1/900/600",
    createdAt: "2024-05-30T12:00:00.000Z",
    likes: 38,
    comments: 5,
  },
];

export type ResolvedFeedAuthor = {
  name: string;
  avatarUrl: string;
  subtitle: string;
  href: string;
  verified: boolean;
};

/** Résout l'auteur d'un post à partir des données athlète/organisation existantes. */
export function resolveFeedAuthor(post: MockFeedPost): ResolvedFeedAuthor | null {
  if (post.authorType === "athlete") {
    const athlete = findMockAthleteById(post.authorId);
    if (!athlete) return null;
    return {
      name: `${athlete.firstName} ${athlete.lastName}`,
      avatarUrl: athlete.avatarUrl,
      subtitle: athlete.sports[0]?.positionLabelFr ?? athlete.currentClub,
      href: `/athletes/${athlete.id}`,
      verified: athlete.verified,
    };
  }

  const org = findMockOrgById(post.authorId);
  if (!org) return null;
  return {
    name: org.name,
    avatarUrl: org.logoUrl,
    subtitle: org.type === "club" ? "Club" : "Agence de recrutement",
    href: "/search",
    verified: org.verified,
  };
}

export function resolveFeedOffer(post: MockFeedPost) {
  if (!post.offerId) return null;
  const offer = findMockOfferById(post.offerId);
  if (!offer) return null;
  return offer;
}

/** Les posts les plus récents en premier (tri déjà appliqué sur le jeu de données, sécurisé ici aussi). */
export function getSortedMockFeedPosts(): MockFeedPost[] {
  return [...MOCK_FEED_POSTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
