"use client";

/**
 * Service AI Scouting : parsing de requêtes → filtres → scoring athlètes.
 * Bascule entre mode démo (mock results) et réel (Supabase queries).
 */

import { getDataSource, ok, err, type ServiceResult } from "./index";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { z } from "zod";

export interface ScoringCriteria {
  sports?: string[];
  levels?: string[];
  positions?: string[];
  countries?: string[];
  minAge?: number;
  maxAge?: number;
}

export interface ScoredAthlete {
  id: string;
  name: string;
  score: number; // 0-100
  matchReasons: string[];
  avatar?: string;
  country?: string;
  sports?: string[];
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const MOCK_CONVERSATIONS: Map<string, AiConversation> = new Map();
const MOCK_MESSAGES: Map<string, ConversationMessage[]> = new Map();

export class AiScoutingService {
  private source = getDataSource();

  /**
   * Parser une requête texte en critères de filtrage
   * Ex: "Je cherche des ailiers rapides en foot, niveau semi-pro, en Europe"
   */
  async parseQuery(query: string): Promise<ServiceResult<ScoringCriteria>> {
    // Simple parsing basé sur keywords (en prod, utiliser LLM réel)
    const criteria: ScoringCriteria = {
      sports: [],
      levels: [],
      positions: [],
      countries: [],
    };

    const queryLower = query.toLowerCase();

    // Sports
    if (queryLower.includes("foot") || queryLower.includes("football")) criteria.sports?.push("football");
    if (queryLower.includes("basket")) criteria.sports?.push("basketball");
    if (queryLower.includes("tennis")) criteria.sports?.push("tennis");
    if (queryLower.includes("athletism") || queryLower.includes("athletisme")) criteria.sports?.push("athletisme");
    if (queryLower.includes("swim") || queryLower.includes("nata")) criteria.sports?.push("natation");
    if (queryLower.includes("cycl")) criteria.sports?.push("cyclisme");
    if (queryLower.includes("handball")) criteria.sports?.push("handball");
    if (queryLower.includes("volley")) criteria.sports?.push("volleyball");

    // Niveaux
    if (queryLower.includes("beginner") || queryLower.includes("debutant")) criteria.levels?.push("beginner");
    if (queryLower.includes("amateur")) criteria.levels?.push("amateur");
    if (queryLower.includes("semi-pro") || queryLower.includes("semi-professionnel")) criteria.levels?.push("semi_pro");
    if (queryLower.includes("pro") || queryLower.includes("professionnel")) criteria.levels?.push("pro");

    // Postes
    if (queryLower.includes("ailier")) criteria.positions?.push("ailier");
    if (queryLower.includes("avant")) criteria.positions?.push("avant");
    if (queryLower.includes("arriere") || queryLower.includes("arrière")) criteria.positions?.push("arriere");
    if (queryLower.includes("defenseur") || queryLower.includes("défenseur")) criteria.positions?.push("defenseur");
    if (queryLower.includes("gardien") || queryLower.includes("goalie")) criteria.positions?.push("gardien");

    // Pays
    if (queryLower.includes("france")) criteria.countries?.push("France");
    if (queryLower.includes("spain") || queryLower.includes("espagne")) criteria.countries?.push("Spain");
    if (queryLower.includes("germany") || queryLower.includes("allemagne")) criteria.countries?.push("Germany");
    if (queryLower.includes("italy") || queryLower.includes("italie")) criteria.countries?.push("Italy");
    if (queryLower.includes("europe")) criteria.countries = ["France", "Spain", "Germany", "Italy"];

    return ok(criteria);
  }

  /**
   * Scorer les athlètes basé sur critères
   */
  async scoreAthletes(
    criteria: ScoringCriteria,
    limit = 10
  ): Promise<ServiceResult<ScoredAthlete[]>> {
    if (this.source === "demo") {
      return this.scoreMockAthletes(criteria, limit);
    }

    // En mode réel, requête Supabase + scoring via fonction SQL ou en app
    // TODO: implémenter requête réelle quand backend prêt
    return this.scoreMockAthletes(criteria, limit);
  }

  /**
   * Scorer les athlètes mockés
   */
  private scoreMockAthletes(criteria: ScoringCriteria, limit: number): ServiceResult<ScoredAthlete[]> {
    const scored = MOCK_ATHLETES.map((athlete) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Sports matching
      if (criteria.sports && criteria.sports.length > 0) {
        const sportMatch = athlete.sports?.find((s) => criteria.sports?.includes(s.sportSlug));
        if (sportMatch) {
          score += 20;
          reasons.push(`Joue ${sportMatch.sportSlug}`);
        }
      }

      // Levels matching
      if (criteria.levels && criteria.levels.length > 0) {
        const levelMatch = athlete.sports?.find((s) => criteria.levels?.includes(s.level));
        if (levelMatch) {
          score += 15;
          reasons.push(`Niveau ${levelMatch.level}`);
        }
      }

      // Positions matching
      if (criteria.positions && criteria.positions.length > 0) {
        const posMatch = athlete.sports?.find((s) => criteria.positions?.includes(s.positionLabelFr?.toLowerCase() || ""));
        if (posMatch) {
          score += 15;
          reasons.push(`Poste: ${posMatch.positionLabelFr}`);
        }
      }

      // Country matching
      if (criteria.countries && criteria.countries.length > 0 && athlete.country) {
        if (criteria.countries.includes(athlete.country)) {
          score += 10;
          reasons.push(`Basé en ${athlete.country}`);
        }
      }

      // Age matching (simulation)
      if (criteria.minAge || criteria.maxAge) {
        score += 5;
        reasons.push("Critères d'âge correspondants");
      }

      const fullName = `${athlete.firstName} ${athlete.lastName}`;

      return {
        id: athlete.id,
        name: fullName,
        score: Math.min(100, score),
        matchReasons: reasons.length > 0 ? reasons : ["Profil intéressant"],
        avatar: athlete.avatarUrl,
        country: athlete.country,
        sports: athlete.sports?.map((s) => s.sportSlug),
      };
    });

    // Trier par score et limiter
    return ok(
      scored.sort((a, b) => b.score - a.score).slice(0, limit)
    );
  }

  /**
   * Créer une conversation IA
   */
  async createConversation(userId: string, title: string): Promise<ServiceResult<AiConversation>> {
    if (this.source === "demo") {
      const conv: AiConversation = {
        id: `ai-conv-${Date.now()}`,
        userId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_CONVERSATIONS.set(conv.id, conv);
      MOCK_MESSAGES.set(conv.id, []);
      return ok(conv);
    }

    // Mode réel: insert dans ai_conversations table
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) return err(`Failed to create conversation: ${error.message}`);

    return ok({
      id: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  }

  /**
   * Lister les conversations d'un utilisateur
   */
  async listConversations(userId: string): Promise<ServiceResult<AiConversation[]>> {
    if (this.source === "demo") {
      const convs = Array.from(MOCK_CONVERSATIONS.values()).filter((c) => c.userId === userId);
      return ok(convs);
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) return err(`Failed to fetch conversations: ${error.message}`);

    return ok(
      (data || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
    );
  }

  /**
   * Ajouter un message à une conversation
   */
  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ServiceResult<ConversationMessage>> {
    if (this.source === "demo") {
      const msg: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role,
        content,
        createdAt: new Date().toISOString(),
      };
      const convMessages = MOCK_MESSAGES.get(conversationId) || [];
      convMessages.push(msg);
      MOCK_MESSAGES.set(conversationId, convMessages);
      return ok(msg);
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) return err(`Failed to add message: ${error.message}`);

    return ok({
      id: data.id,
      role: data.role,
      content: data.content,
      createdAt: data.created_at,
    });
  }

  /**
   * Charger les messages d'une conversation
   */
  async getMessages(conversationId: string): Promise<ServiceResult<ConversationMessage[]>> {
    if (this.source === "demo") {
      const messages = MOCK_MESSAGES.get(conversationId) || [];
      return ok(messages);
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return err(`Failed to fetch messages: ${error.message}`);

    return ok(
      (data || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      }))
    );
  }
}

export const aiScoutingService = new AiScoutingService();
