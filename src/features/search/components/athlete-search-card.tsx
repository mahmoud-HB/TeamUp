"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { SearchResult } from "@/lib/services/search-service";
import { SPORTS_LABELS, LEVELS } from "@/lib/constants";

interface AthleteSearchCardProps {
  athlete: SearchResult;
}

export function AthleteSearchCard({ athlete }: AthleteSearchCardProps) {
  const primarySport = athlete.sports[0];
  const levelLabel = primarySport
    ? LEVELS[primarySport.level as keyof typeof LEVELS] || primarySport.level
    : "-";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {athlete.avatarUrl ? (
              <Image
                src={athlete.avatarUrl}
                alt={athlete.firstName}
                width={120}
                height={120}
                className="w-28 h-28 sm:w-24 sm:h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-28 h-28 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {athlete.firstName.charAt(0)}
                {athlete.lastName.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name & Verification */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {athlete.firstName} {athlete.lastName}
              </h3>
              {athlete.verified && (
                <BadgeCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </div>

            {/* Username */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              @{athlete.username}
            </p>

            {/* Bio */}
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
              {athlete.bio}
            </p>

            {/* Sports & Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {primarySport && (
                <>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                    {SPORTS_LABELS[primarySport.sportSlug] || primarySport.sportSlug}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
                  >
                    {levelLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700"
                  >
                    {primarySport.positionLabelFr}
                  </Badge>
                </>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              {athlete.country && (
                <span>{athlete.countryFlag} {athlete.country}</span>
              )}
              {athlete.currentClub && (
                <span>📍 {athlete.currentClub}</span>
              )}
              {athlete.compatibilityScore !== undefined && (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {athlete.compatibilityScore}% match
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 flex items-center">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Link href={`/athletes/${athlete.id}`}>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
