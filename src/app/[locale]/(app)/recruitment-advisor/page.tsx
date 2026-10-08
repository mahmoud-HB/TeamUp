"use client";

import { useState, useRef, useEffect } from "react";
import { RecruitmentAdvisorService, type RecruitmentQuery, type CandidateRecommendation } from "@/lib/services/recruitment-advisor-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Star, MessageSquare, Zap, Search, Heart } from "lucide-react";
import Image from "next/image";

export default function RecruitmentAdvisorPage({ params }: { params: { locale: string } }) {
  const isEnglish = params.locale === "en";
  const [sessionId, setSessionId] = useState<string>("");
  const [conversation, setConversation] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>([]);
  const [savedCandidates, setSavedCandidates] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"chat" | "candidates">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const initializeSession = async () => {
    try {
      const result = await RecruitmentAdvisorService.startSession("user-123");
      if (result.ok) {
        setSessionId(result.data.id);
        setConversation(result.data.conversation);
      }
    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage;
    setInputMessage("");

    try {
      const result = await RecruitmentAdvisorService.sendMessage(sessionId, userMessage);
      if (result.ok) {
        setConversation((prev) => [
          ...prev,
          { role: "recruiter", message: userMessage, timestamp: new Date().toISOString(), id: Date.now() },
          { role: "advisor", message: result.data.response, suggestedQuestions: result.data.suggestedQuestions, timestamp: new Date().toISOString(), id: Date.now() + 1 },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleQuestionClick = async (question: string) => {
    setInputMessage(question);
    await handleSendMessage();
  };

  const handleGetRecommendations = async () => {
    if (!sessionId) return;

    const query: RecruitmentQuery = {
      role: "Support",
      game: "Valorant",
      requiredRank: "Diamond",
      language: ["English", "French"],
    };

    try {
      const result = await RecruitmentAdvisorService.getRecommendations(sessionId, query);
      if (result.ok) {
        setRecommendations(result.data);
        setActiveTab("candidates");
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
  };

  const toggleSaveCandidate = (athleteId: string) => {
    const newSaved = new Set(savedCandidates);
    if (newSaved.has(athleteId)) {
      newSaved.delete(athleteId);
    } else {
      newSaved.add(athleteId);
    }
    setSavedCandidates(newSaved);
    if (!newSaved.has(athleteId)) {
      RecruitmentAdvisorService.saveCandidateToSession(sessionId, athleteId).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              {isEnglish ? "AI Recruitment Advisor" : "Conseiller Recrutement IA"}
            </h1>
          </div>
          <p className="text-slate-300">
            {isEnglish
              ? "Find the perfect players for your team with AI-powered guidance"
              : "Trouvez les joueurs parfaits pour votre équipe avec l'aide de l'IA"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "chat"
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <MessageCircle className="inline w-4 h-4 mr-2" />
            {isEnglish ? "Chat" : "Dialogue"}
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-4 py-2 rounded-lg font-semibold transition relative ${
              activeTab === "candidates"
                ? "bg-blue-600 text-white"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Search className="inline w-4 h-4 mr-2" />
            {isEnglish ? "Candidates" : "Candidats"}
            {recommendations.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {recommendations.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "chat" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700/50 flex flex-col h-[600px]">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full mb-4" />
                      <p className="text-slate-300">{isEnglish ? "Loading..." : "Chargement..."}</p>
                    </div>
                  </div>
                ) : (
                  conversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "recruiter" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          msg.role === "recruiter"
                            ? "bg-blue-600/30 border border-blue-500/50 text-slate-100"
                            : "bg-slate-700/50 border border-slate-600/50 text-slate-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.suggestedQuestions.map((q: string, j: number) => (
                              <button
                                key={j}
                                onClick={() => handleQuestionClick(q)}
                                className="block w-full text-left px-3 py-2 bg-slate-600/50 hover:bg-slate-600 rounded text-xs text-slate-100 transition"
                              >
                                → {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-700/50 p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={isEnglish ? "Ask for players..." : "Chercher des joueurs..."}
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleGetRecommendations}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg transition"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isEnglish ? "Get AI Recommendations" : "Obtenir les recommandations IA"}
                </Button>
              </div>
            </Card>

            {/* Sidebar Info */}
            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {isEnglish ? "Tips" : "Conseils"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span>🎮</span>
                  <span>{isEnglish ? "Be specific about game and role" : "Soyez précis sur le jeu et le rôle"}</span>
                </li>
                <li className="flex gap-2">
                  <span>📊</span>
                  <span>{isEnglish ? "Mention required rank level" : "Mentionnez le rang requis"}</span>
                </li>
                <li className="flex gap-2">
                  <span>🌍</span>
                  <span>{isEnglish ? "Specify language preferences" : "Précisez les langues souhaitées"}</span>
                </li>
                <li className="flex gap-2">
                  <span>⚡</span>
                  <span>{isEnglish ? "AI learns from your feedback" : "L'IA apprend de vos retours"}</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : (
          <div>
            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.length === 0 ? (
                <Card className="lg:col-span-3 bg-slate-800/50 border-slate-700/50 p-12 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-300 mb-4">
                    {isEnglish
                      ? "No candidates yet. Ask the AI advisor for recommendations"
                      : "Aucun candidat pour le moment. Demandez des recommandations à l'IA"}
                  </p>
                  <Button
                    onClick={() => setActiveTab("chat")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isEnglish ? "Back to Chat" : "Retour au dialogue"}
                  </Button>
                </Card>
              ) : (
                recommendations.map((rec) => (
                  <Card
                    key={rec.athlete.id}
                    className="bg-slate-800/50 border-slate-700/50 overflow-hidden hover:border-slate-600 transition group"
                  >
                    {/* Header */}
                    <div className="relative h-32 bg-gradient-to-br from-slate-700 to-slate-800">
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-4 border-white/20 bg-slate-600 overflow-hidden">
                            <Image
                              src={rec.athlete.avatarUrl}
                              alt={rec.athlete.username}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{rec.athlete.firstName}</h4>
                            <p className="text-xs text-slate-300">@{rec.athlete.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSaveCandidate(rec.athlete.id)}
                          className={`p-2 rounded transition ${
                            savedCandidates.has(rec.athlete.id)
                              ? "bg-red-500/20 text-red-400"
                              : "bg-slate-700/50 text-slate-400 hover:text-red-400"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${savedCandidates.has(rec.athlete.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Compatibility Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-300">
                          {isEnglish ? "Compatibility" : "Compatibilité"}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition"
                              style={{ width: `${rec.compatibilityScore}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-green-400">{rec.compatibilityScore}%</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-700/30 p-2 rounded">
                          <p className="text-slate-400">{isEnglish ? "Level" : "Niveau"}</p>
                          <p className="font-semibold text-white">{rec.athlete.sports[0]?.level}</p>
                        </div>
                        <div className="bg-slate-700/30 p-2 rounded">
                          <p className="text-slate-400">{isEnglish ? "Current Club" : "Club actuel"}</p>
                          <p className="font-semibold text-white truncate">{rec.athlete.currentClub}</p>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      <div>
                        <p className="text-xs font-semibold text-slate-300 mb-1">
                          {isEnglish ? "Why matching" : "Pourquoi compatible"}
                        </p>
                        <div className="space-y-1">
                          {rec.matchReasons.slice(0, 2).map((reason, i) => (
                            <p key={i} className="text-xs text-slate-400">
                              {reason}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            // Navigate to player profile
                          }}
                        >
                          {isEnglish ? "View Profile" : "Voir profil"}
                        </Button>
                        <Button
                          className="flex-1 text-xs h-8 bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            // Send message
                          }}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
