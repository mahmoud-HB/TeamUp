"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messagingService, type Conversation, type Message } from "@/lib/services/messaging-service";
import { Loader2 } from "lucide-react";

/**
 * Page de messagerie : lister conversations et échanger messages.
 * Bascule automatique mock ↔ Supabase selon NEXT_PUBLIC_DEMO_MODE.
 */
export function MessagesPageClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Mock: utiliser un userId fixe en démo (en réalité, vient du contexte auth)
  const mockUserId = "ath-001";
  const mockOtherId = "ath-002"; // Pour test : créer une conv avec un autre athlète

  // Charger les conversations au montage
  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      const result = await messagingService.listConversations(mockUserId);
      if (result.ok) {
        setConversations(result.data);
        if (result.data.length > 0) {
          setSelectedConvId(result.data[0].id);
        }
      }
      setLoading(false);
    }
    loadConversations();
  }, []);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConvId) return;

    async function loadMessages() {
      const result = await messagingService.getMessages(selectedConvId as string);
      if (result.ok) {
        setMessages(result.data);
      }
    }
    loadMessages();
  }, [selectedConvId]);

  // Créer ou basculer vers une conversation
  async function handleCreateOrSwitchConversation(otherId: string) {
    const result = await messagingService.getOrCreateConversation(mockUserId, otherId);
    if (result.ok) {
      setSelectedConvId(result.data.id);
      if (!conversations.find((c) => c.id === result.data.id)) {
        setConversations([...conversations, result.data]);
      }
    }
  }

  // Envoyer un message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedConvId) return;

    setSending(true);
    const result = await messagingService.sendMessage(selectedConvId, mockUserId, input);
    if (result.ok) {
      setMessages([...messages, result.data]);
      setInput("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid h-screen grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {/* Sidebar: Liste des conversations */}
      <div className="border-r md:col-span-1">
        <div className="mb-4">
          <h2 className="font-semibold">Messages</h2>
          <Button
            size="sm"
            className="mt-2 w-full"
            onClick={() => handleCreateOrSwitchConversation(mockOtherId)}
          >
            Nouveau message
          </Button>
        </div>

        <div className="space-y-2 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucune conversation</p>
          ) : (
            conversations.map((conv) => {
              const otherUserId =
                conv.participant1Id === mockUserId ? conv.participant2Id : conv.participant1Id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full rounded-lg p-2 text-left text-sm transition ${
                    selectedConvId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {otherUserId}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Messages et formulaire */}
      <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-3">
        {selectedConvId ? (
          <>
            {/* Messages */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "400px" }}>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun message</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-2 text-sm ${
                        msg.senderId === mockUserId
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      <p className="text-xs font-semibold">{msg.senderId}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-75">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Formulaire d'envoi */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Écrire un message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !input.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
              </Button>
            </form>
          </>
        ) : (
          <Card className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Sélectionne ou crée une conversation</p>
          </Card>
        )}
      </div>
    </div>
  );
}
