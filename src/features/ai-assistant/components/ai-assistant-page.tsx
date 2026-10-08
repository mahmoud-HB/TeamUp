"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles } from "lucide-react";
import { aiScoutingService, type ScoredAthlete, type ConversationMessage } from "@/lib/services/ai-scouting-service";

/**
 * Page Assistant IA de Scouting
 * Recruiter interroge l'IA pour trouver les meilleurs athlètes
 */
export function AiAssistantPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoredAthletes, setScoredAthletes] = useState<ScoredAthlete[]>([]);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mockUserId = "recruiter-001"; // En réalité, vient du contexte auth

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    try {
      // Parser la requête
      const parseResult = await aiScoutingService.parseQuery(input);
      if (!parseResult.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-error`,
            role: "assistant",
            content: "Erreur: impossible de traiter ta demande",
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }

      // Scorer les athlètes
      const scoreResult = await aiScoutingService.scoreAthletes(parseResult.data, 10);
      if (!scoreResult.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-error`,
            role: "assistant",
            content: "Erreur: impossible de scorer les athlètes",
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }

      setScoredAthletes(scoreResult.data);
      setShowResults(true);

      // Réponse assistant
      const summary = `J'ai trouvé ${scoreResult.data.length} athlètes correspondant à ta demande. Les meilleurs sont affichés ci-dessous avec leurs scores de compatibilité.`;
      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: summary,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-screen grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {/* Sidebar: Chat History */}
      <div className="border-r md:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Assistant IA</h2>
        </div>
        <Button className="w-full" onClick={() => { setMessages([]); setScoredAthletes([]); setShowResults(false); }}>
          Nouvelle recherche
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Décris les athlètes que tu cherches : sport, niveau, poste, pays...
        </p>
      </div>

      {/* Main: Chat & Results */}
      <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-3">
        {/* Chat Messages */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "300px" }}>
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Raconte-moi quel type d'athlète tu recherches...
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "ml-auto max-w-xs bg-primary text-primary-foreground"
                      : "max-w-xs bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Cherche des...ailiers rapides en foot, semi-pro..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Results Grid */}
        {showResults && scoredAthletes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résultats ({scoredAthletes.length})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {scoredAthletes.map((athlete) => (
                <Card key={athlete.id} className="flex gap-3 p-3">
                  {athlete.avatar && (
                    <img
                      src={athlete.avatar}
                      alt={athlete.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{athlete.name}</p>
                      <Badge className="bg-primary text-primary-foreground">
                        {athlete.score}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {athlete.country}
                      {athlete.sports && ` • ${athlete.sports.join(", ")}`}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {athlete.matchReasons.slice(0, 2).map((reason, idx) => (
                        <span key={idx} className="inline-block rounded bg-secondary px-2 py-0.5 text-xs">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
