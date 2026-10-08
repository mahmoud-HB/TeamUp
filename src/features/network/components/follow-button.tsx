"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FollowService } from "@/lib/services/follow-service";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  targetId: string;
  currentUserId?: string;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline";
}

export function FollowButton({
  targetId,
  currentUserId,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
  size = "md",
  variant = "default",
}: FollowButtonProps) {
  const t = useTranslations("Network");
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        const result = await FollowService.unfollow(currentUserId, targetId);
        if (result.ok) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const result = await FollowService.follow(currentUserId, targetId);
        if (result.ok) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize: any = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";
  const buttonVariant = isFollowing ? "outline" : variant;

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading || !currentUserId}
      size={buttonSize}
      variant={buttonVariant}
      className={
        isFollowing
          ? "text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
          : ""
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t("loading")}
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          {t("following")}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          {t("follow")}
        </>
      )}
    </Button>
  );
}
