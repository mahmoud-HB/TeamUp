"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "./follow-button";
import { FollowSuggestion } from "@/lib/services/follow-service";
import { BadgeCheck, Users } from "lucide-react";

interface FollowSuggestionCardProps {
  suggestion: FollowSuggestion;
  currentUserId?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowSuggestionCard({
  suggestion,
  currentUserId,
  onFollowChange,
}: FollowSuggestionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          {suggestion.avatarUrl ? (
            <Image
              src={suggestion.avatarUrl}
              alt={suggestion.firstName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
              {suggestion.firstName.charAt(0)}
              {suggestion.lastName.charAt(0)}
            </div>
          )}

          {/* Name & Verification */}
          <div>
            <div className="flex items-center justify-center gap-2">
              <Link
                href={`/athletes/${suggestion.id}`}
                className="font-semibold text-slate-900 dark:text-white hover:text-blue-600"
              >
                {suggestion.firstName} {suggestion.lastName}
              </Link>
              {suggestion.verified && (
                <BadgeCheck className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              @{suggestion.username}
            </p>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {suggestion.bio}
          </p>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
            {suggestion.country && <span>📍 {suggestion.country}</span>}
            {suggestion.currentClub && <span>🏟️ {suggestion.currentClub}</span>}
          </div>

          {/* Stats */}
          <div className="flex gap-4 justify-center text-xs">
            <div className="text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                {suggestion.followerCount}
              </p>
              <p className="text-slate-600 dark:text-slate-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                {suggestion.followingCount}
              </p>
              <p className="text-slate-600 dark:text-slate-400">Following</p>
            </div>
          </div>

          {/* Reason / Mutual Follows */}
          {suggestion.reason && (
            <Badge variant="secondary" className="gap-1">
              {suggestion.mutualFollows && suggestion.mutualFollows > 0 && (
                <>
                  <Users className="w-3 h-3" />
                  {suggestion.mutualFollows} mutual
                </>
              )}
              {!suggestion.mutualFollows || suggestion.mutualFollows === 0 ? (
                suggestion.reason
              ) : null}
            </Badge>
          )}

          {/* Follow Button */}
          <FollowButton
            targetId={suggestion.id}
            currentUserId={currentUserId}
            isFollowing={suggestion.isFollowing}
            onFollowChange={onFollowChange}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
