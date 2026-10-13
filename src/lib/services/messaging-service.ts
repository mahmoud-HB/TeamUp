"use client";

/**
 * Service Messagerie : conversations et messages avec bascule mock/Supabase.
 */

import { getDataSource, ok, err, type ServiceResult } from "./core";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

/**
 * Stockage mock de conversations et messages en localStorage (démo uniquement)
 */
const DEMO_STORAGE_KEY = "scoutly_demo_conversations";

function getDemoConversations(): Map<string, Conversation> {
  if (typeof window === "undefined") return new Map();
  try {
    const data = localStorage.getItem(DEMO_STORAGE_KEY);
    const conversations = data ? JSON.parse(data) : {};
    return new Map(Object.entries(conversations));
  } catch {
    return new Map();
  }
}

function saveDemoConversations(conversations: Map<string, Conversation>) {
  if (typeof window === "undefined") return;
  try {
    const obj = Object.fromEntries(conversations);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    console.error("Failed to save conversations to localStorage");
  }
}

export class MessagingService {
  private source = getDataSource();

  /**
   * Récupérer ou créer une conversation entre deux utilisateurs
   */
  async getOrCreateConversation(
    userId1: string,
    userId2: string
  ): Promise<ServiceResult<Conversation>> {
    if (this.source === "demo") {
      const conversations = getDemoConversations();
      const key1 = [userId1, userId2].sort().join("|");
      
      if (conversations.has(key1)) {
        return ok(conversations.get(key1)!);
      }

      const conv: Conversation = {
        id: `conv-${Date.now()}`,
        participant1Id: userId1,
        participant2Id: userId2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      conversations.set(key1, conv);
      saveDemoConversations(conversations);
      return ok(conv);
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const [p1, p2] = [userId1, userId2].sort();

    // Chercher une conversation existante
    const { data: existing, error: searchError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(participant_1_id.eq.${p1},participant_2_id.eq.${p2}),and(participant_1_id.eq.${p2},participant_2_id.eq.${p1})`
      )
      .limit(1)
      .single();

    if (existing) {
      return ok({
        id: existing.id,
        participant1Id: existing.participant_1_id,
        participant2Id: existing.participant_2_id,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      });
    }

    // Créer une nouvelle conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        participant_1_id: p1,
        participant_2_id: p2,
      })
      .select()
      .single();

    if (createError) return err(`Failed to create conversation: ${createError.message}`);

    return ok({
      id: newConv.id,
      participant1Id: newConv.participant_1_id,
      participant2Id: newConv.participant_2_id,
      createdAt: newConv.created_at,
      updatedAt: newConv.updated_at,
    });
  }

  /**
   * Lister les conversations d'un utilisateur
   */
  async listConversations(userId: string): Promise<ServiceResult<Conversation[]>> {
    if (this.source === "demo") {
      const conversations = getDemoConversations();
      const userConversations = Array.from(conversations.values()).filter(
        (c) => c.participant1Id === userId || c.participant2Id === userId
      );
      return ok(userConversations);
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) return err(`Failed to fetch conversations: ${error.message}`);

    return ok(
      (data || []).map((c: any) => ({
        id: c.id,
        participant1Id: c.participant_1_id,
        participant2Id: c.participant_2_id,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
    );
  }

  /**
   * Envoyer un message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<ServiceResult<Message>> {
    if (this.source === "demo") {
      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        content,
        createdAt: new Date().toISOString(),
      };
      // En démo, on stocke pas vraiment les messages (simplification)
      // L'UI gérera l'affichage local
      return ok(message);
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) return err(`Failed to send message: ${error.message}`);

    return ok({
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      content: data.content,
      readAt: data.read_at,
      createdAt: data.created_at,
    });
  }

  /**
   * Charger les messages d'une conversation
   */
  async getMessages(conversationId: string, limit = 50): Promise<ServiceResult<Message[]>> {
    if (this.source === "demo") {
      // En démo, retourner un tableau vide (pas de persistance)
      return ok([]);
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return err(`Failed to fetch messages: ${error.message}`);

    return ok(
      (data || []).map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        readAt: m.read_at,
        createdAt: m.created_at,
      }))
    );
  }

  /**
   * Marquer un message comme lu
   */
  async markMessageAsRead(messageId: string): Promise<ServiceResult<boolean>> {
    if (this.source === "demo") {
      return ok(true);
    }

    // Supabase réel
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) return err(`Failed to mark message as read: ${error.message}`);

    return ok(true);
  }
}

export const messagingService = new MessagingService();
