"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle, Users } from "lucide-react";
import { FollowService, FollowSuggestion } from "@/lib/services/follow-service";
import { FollowSuggestionCard } from "./follow-suggestion-card";
import { Button } from "@/components/ui/button";

interface NetworkPageProps {
  currentUserId?: string;
}

export function NetworkPage({ currentUserId }: NetworkPageProps) {
  const t = useTranslations("Network");
  const [suggestions, setSuggestions] = useState<FollowSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [currentUserId]);

  const loadSuggestions = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setHasError(false);

    const result = await FollowService.getFollowSuggestions(currentUserId);
    if (result.ok) {
      setSuggestions(result.data);
    } else {
      setHasError(true);
    }

    setIsLoading(false);
  };

  const handleFollowChange = (suggestionId: string, isFollowing: boolean) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestionId ? { ...s, isFollowing } : s
      )
    );
  };

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">
            {t("loginRequired")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t("subtitle")}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              {t("loading")}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {t("error")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {t("errorDescription")}
            </p>
            <Button onClick={loadSuggestions} variant="outline">
              {t("retry")}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && suggestions.length === 0 && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {t("noSuggestions")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("noSuggestionsDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Grid of Suggestions */}
      {!isLoading && !hasError && suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {suggestions.map((suggestion) => (
            <FollowSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              currentUserId={currentUserId}
              onFollowChange={(isFollowing) =>
                handleFollowChange(suggestion.id, isFollowing)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
