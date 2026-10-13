/**
 * RecruitmentAdvisorService: AI-Guided recruitment advisor with mock LLM
 * Simulates intelligent candidate recommendations based on recruiter queries
 * Ready for integration with OpenAI/Claude APIs
 */

import { ServiceResult, ok, err, isDemoMode } from "./core";
import { ALL_MOCK_ATHLETES } from "@/lib/mock/athletes-extended";
import type { MockAthlete } from "@/lib/mock/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface RecruitmentQuery {
  role: string; // "Support", "ADC", "Mid", "Top", "Jungle", etc.
  game?: string; // "Valorant", "League of Legends", "CS2", etc.
  requiredRank?: string; // "Diamond", "Immortal", "Pro", etc.
  teamSize?: number;
  location?: string;
  language?: string[];
  experience?: string; // "junior", "semi_pro", "pro"
  specialSkills?: string[];
  additionalContext?: string; // Free-text context from recruiter
}

export interface CandidateRecommendation {
  athlete: MockAthlete;
  compatibilityScore: number; // 0-100
  matchReasons: string[];
  strengths: string[];
  potentialConcerns?: string[];
  recommendedMessageTemplate?: string;
}

export interface AIConversationTurn {
  id: string;
  role: "recruiter" | "advisor";
  message: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

export interface RecruitmentSession {
  id: string;
  recruiterId: string;
  createdAt: string;
  conversation: AIConversationTurn[];
  currentQuery?: RecruitmentQuery;
  recommendations?: CandidateRecommendation[];
  savedCandidates: string[]; // athlete IDs
}

// ============ MOCK LLM RESPONSES ============

const ADVISOR_RESPONSES: Record<string, { response: string; questions: string[] }> = {
  initial: {
    response:
      "Bienvenue dans votre assistant de recrutement IA! 🎮 Je suis ici pour vous aider à trouver les talents parfaits pour votre équipe. Dites-moi:\n\n1. Quel jeu cherchez-vous à recruter? (Valorant, LoL, CS2, etc.)\n2. Quel rôle vous manque?\n3. Quel niveau compétitif visez-vous?",
    questions: [
      "Je cherche un support pour Valorant",
      "Je cherche un mid lane pour League of Legends",
      "Je cherche un rifler pour CS2",
      "Je cherche des joueurs polyvalents",
    ],
  },
  valorant_support: {
    response:
      "Excellent! Un support Valorant. Très utile pour stabiliser votre composition.\n\n📊 Critères typiques pour un bon support:\n• Classement minimum: Ascendant 2-Radiant\n• Champions clés: Sage, Astra, Omen, Viper\n• Communication excellente\n• Sens du map control avancé\n\nVoulez-vous que je cherche des joueurs avec ces critères?",
    questions: [
      "Oui, trouvez les meilleurs supports Valorant",
      "Je préfère les jeunes talents moins expérimentés",
      "Quelle région géographique?",
      "Budget/contrat: salaire et durée?",
    ],
  },
  lol_mid: {
    response:
      "Midlaner pour League of Legends - position cruciale! 🎯\n\n📈 Profil idéal pour un mid:\n• Rang: Diamond 1+ (professionnels) ou Diamond 3+ (académie)\n• Champions principaux: Ahri, Syndra, Viktor, Yasuo\n• Macro-play et roaming\n• Capacité à jouer plusieurs rôles (flex)\n\nCe que nous cherchons surtout: intelligence de jeu et pilotage mécanique.\n\nCommençons l'analyse des candidats!",
    questions: [
      "Montrez les meilleurs mids classés Diamond+",
      "Cherchez des jeunes talents prometteurs",
      "Avez-vous des critères géographiques?",
      "Quel type de contrat envisagez-vous?",
    ],
  },
};

const RECRUITING_INSIGHTS: Record<string, string> = {
  valorant_support:
    "Les supports Valorant avec expérience IGL sont 3x plus recherchés. Considérez les joueurs ayant coaché ou aidé d'autres équipes.",
  lol_mid:
    "Les mids multipostes (flex top/mid) sont très prisés. Cherchez des joueurs ayant joué plusieurs rôles avec 50%+ winrate.",
  cs2_rifler:
    "Préférez les riflers avec <100ms ping stable et expérience LAN. Le clutch ability (1v4+) est un bonus énorme.",
  esports_general:
    "La comunicación y el trabajo en equipo suelen ser tan importantes como el skill mecánico. Entreviste candidatos.",
};

// ============ MOCK CANDIDATE SCORING ============

function calculateCompatibility(athlete: MockAthlete, query: RecruitmentQuery): number {
  let score = 50;

  // Game match
  if (query.game && athlete.sports[0]?.sportSlug.includes(query.game.toLowerCase())) {
    score += 20;
  }

  // Rank match
  if (query.requiredRank) {
    const athleteLevel = athlete.sports[0]?.level || "amateur";
    const levelMap: Record<string, number> = {
      amateur: 30,
      semi_pro: 70,
      pro: 100,
    };
    const rankDistance = Math.abs(levelMap[athleteLevel] - (levelMap[query.requiredRank.toLowerCase()] || 50));
    score += Math.max(0, 20 - rankDistance / 5);
  }

  // Location bonus
  if (query.location && athlete.country.toLowerCase().includes(query.location.toLowerCase())) {
    score += 10;
  }

  // Language match
  if (query.language && query.language.length > 0) {
    const hasLanguage = query.language.some((lang) =>
      athlete.languages.join(",").toLowerCase().includes(lang.toLowerCase())
    );
    if (hasLanguage) score += 15;
  }

  // Availability bonus
  if (athlete.availability === "free") {
    score += 5;
  }

  // Verified bonus
  if (athlete.verified) {
    score += 10;
  }

  // Randomize slightly for realism
  score += (Math.random() - 0.5) * 10;

  return Math.min(100, Math.max(0, score));
}

function generateMatchReasons(athlete: MockAthlete, query: RecruitmentQuery): string[] {
  const reasons: string[] = [];

  if (athlete.verified) {
    reasons.push("✅ Profil vérifié");
  }

  if (athlete.availability === "free") {
    reasons.push("🎯 Disponible immédiatement");
  }

  const level = athlete.sports[0]?.level || "amateur";
  reasons.push(`📊 Niveau: ${level}`);

  if (athlete.languages.includes("English")) {
    reasons.push("🌍 Anglophone");
  }

  if (athlete.mobility) {
    reasons.push("✈️ Mobilité internationale");
  }

  if (athlete.verified) {
    reasons.push(`⭐ Note moyenne: ${4.2 + Math.random() * 0.7}`);
  }

  return reasons;
}

// ============ CONVERSATION STATE ============

const SESSIONS: Map<string, RecruitmentSession> = new Map();

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ SERVICE API ============

export const RecruitmentAdvisorService = {
  async startSession(recruiterId: string): Promise<ServiceResult<RecruitmentSession>> {
    if (!isDemoMode()) {
      // TODO: Store in Supabase
      return ok({
        id: generateSessionId(),
        recruiterId,
        createdAt: new Date().toISOString(),
        conversation: [],
        savedCandidates: [],
      });
    }

    const session: RecruitmentSession = {
      id: generateSessionId(),
      recruiterId,
      createdAt: new Date().toISOString(),
      conversation: [
        {
          id: `turn-${Date.now()}`,
          role: "advisor",
          message: ADVISOR_RESPONSES.initial.response,
          timestamp: new Date().toISOString(),
          suggestedQuestions: ADVISOR_RESPONSES.initial.questions,
        },
      ],
      savedCandidates: [],
    };

    SESSIONS.set(session.id, session);
    return ok(session);
  },

  async getSession(sessionId: string): Promise<ServiceResult<RecruitmentSession>> {
    const session = SESSIONS.get(sessionId);
    if (!session) {
      return err("Session not found", "SESSION_NOT_FOUND");
    }
    return ok(session);
  },

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<ServiceResult<{ response: string; suggestedQuestions: string[] }>> {
    const sessionResult = await this.getSession(sessionId);
    if (!sessionResult.ok) return err(sessionResult.error, sessionResult.code);

    const session = sessionResult.data;

    // Add recruiter message
    session.conversation.push({
      id: `turn-${Date.now()}`,
      role: "recruiter",
      message,
      timestamp: new Date().toISOString(),
    });

    // Mock LLM response
    let response = "C'est une excellente question! 🤔 Laissez-moi analyser les meilleurs candidats pour vous...";
    let suggestedQuestions: string[] = [];

    if (message.toLowerCase().includes("valorant") && message.toLowerCase().includes("support")) {
      response = ADVISOR_RESPONSES.valorant_support.response;
      suggestedQuestions = ADVISOR_RESPONSES.valorant_support.questions;
    } else if (message.toLowerCase().includes("league") || message.toLowerCase().includes("lol")) {
      response = ADVISOR_RESPONSES.lol_mid.response;
      suggestedQuestions = ADVISOR_RESPONSES.lol_mid.questions;
    } else if (message.toLowerCase().includes("cs2") || message.toLowerCase().includes("counter-strike")) {
      response = "Counter-Strike 2 - Excellent jeu d'équipe! 🎯 Cherchez des riflers avec stabilité mécanique et gameense. Continuons...";
      suggestedQuestions = [
        "Trouvez des riflers CS2 Immortal+",
        "Cherchez des AWPers expérimentés",
        "Quelles sont vos exigences de ping?",
      ];
    } else {
      response =
        "Merci pour cette info! Pour mieux vous recommander des candidats, précisez:\n• Le jeu\n• Le rôle\n• Le niveau d'expérience souhaitée";
      suggestedQuestions = [
        "Je cherche un support pour Valorant",
        "Je cherche un mid pour LoL",
        "Montrez tous les candidats disponibles",
      ];
    }

    session.conversation.push({
      id: `turn-${Date.now()}`,
      role: "advisor",
      message: response,
      timestamp: new Date().toISOString(),
      suggestedQuestions,
    });

    return ok({ response, suggestedQuestions });
  },

  async getRecommendations(
    sessionId: string,
    query: RecruitmentQuery
  ): Promise<ServiceResult<CandidateRecommendation[]>> {
    const sessionResult = await this.getSession(sessionId);
    if (!sessionResult.ok) return err(sessionResult.error, sessionResult.code);

    const session = sessionResult.data;
    session.currentQuery = query;

    // Score all athletes
    const scored = ALL_MOCK_ATHLETES.map((athlete) => ({
      athlete,
      compatibilityScore: calculateCompatibility(athlete, query),
    }));

    // Sort by score and take top 10
    const top = scored
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);

    const recommendations: CandidateRecommendation[] = top.map(({ athlete, compatibilityScore }) => ({
      athlete,
      compatibilityScore: Math.round(compatibilityScore),
      matchReasons: generateMatchReasons(athlete, query),
      strengths: [
        `Expérience de ${athlete.stats[2]?.value || "1"} ans`,
        `Taux de victoire: ${athlete.stats[1]?.value || "50%"}`,
        `${athlete.career[0]?.club || "Independent"} actuellement`,
      ],
      potentialConcerns: compatibilityScore < 70 ? ["Expérience limitée au niveau souhaité"] : [],
      recommendedMessageTemplate: `Salut ${athlete.firstName}! Je suis recruteur pour [TEAM]. Nous avons suivi ta progression et nous croyons que tu serais un excellent fit pour nous...`,
    }));

    session.recommendations = recommendations;
    return ok(recommendations);
  },

  async saveCandidateToSession(sessionId: string, athleteId: string): Promise<ServiceResult<null>> {
    const sessionResult = await this.getSession(sessionId);
    if (!sessionResult.ok) return err(sessionResult.error, sessionResult.code);

    const session = sessionResult.data;
    if (!session.savedCandidates.includes(athleteId)) {
      session.savedCandidates.push(athleteId);
    }

    return ok(null);
  },

  async getSavedCandidates(sessionId: string): Promise<ServiceResult<MockAthlete[]>> {
    const sessionResult = await this.getSession(sessionId);
    if (!sessionResult.ok) return err(sessionResult.error, sessionResult.code);

    const session = sessionResult.data;
    const candidates = ALL_MOCK_ATHLETES.filter((a) => session.savedCandidates.includes(a.id));

    return ok(candidates);
  },

  async getRecruitingInsight(query: RecruitmentQuery): Promise<ServiceResult<string>> {
    const key = `${query.game}_${query.role}`.toLowerCase();
    const insight = RECRUITING_INSIGHTS[key] || "Chaque marché de recrutement est unique. Analysez les profils individuels...";
    return ok(insight);
  },
};
