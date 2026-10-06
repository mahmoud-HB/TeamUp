"use client";

import { useState } from "react";
import { Heart, MessageCircle, BadgeCheck, Briefcase } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyButton } from "@/features/scouting/components/apply-button";
import { cn } from "@/lib/utils";
import {
  resolveFeedAuthor,
  resolveFeedOffer,
  type MockFeedPost,
} from "@/lib/mock/feed";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant",
  amateur: "Amateur",
  semi_pro: "Semi-pro",
  pro: "Professionnel",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Carte de post du fil d'actualité, façon réseau professionnel : photo
 * d'athlète, annonce de palmarès, ou offre de recrutement publiée par un
 * club/agence. Le like est purement local (démo, non persisté) ; la
 * candidature réutilise le flux existant `ApplyButton`.
 */
export function FeedPostCard({ post }: { post: MockFeedPost }) {
  const author = resolveFeedAuthor(post);
  const offer = resolveFeedOffer(post);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  if (!author) return null;

  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-start justify-between gap-2">
          <Link href={author.href} className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarImage src={author.avatarUrl} alt="" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold leading-tight">{author.name}</span>
                {author.verified && (
                  <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {author.subtitle} · {formatRelativeDate(post.createdAt)}
              </p>
            </div>
          </Link>
          {post.kind === "job" && (
            <Badge variant="secondary" className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <Briefcase className="size-3.5" aria-hidden="true" />
              Recrutement
            </Badge>
          )}
        </div>

        <p className="text-sm leading-relaxed">{post.content}</p>

        {post.imageUrl && (
          <div className="-mx-6 overflow-hidden">
            {/* Images de démonstration (picsum.photos), jamais de vrai média utilisateur. */}
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        {offer && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{offer.title}</p>
              <Badge variant="outline">{LEVEL_LABELS[offer.level]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {offer.location} · {offer.positionLabelFr}
            </p>
            <ApplyButton offerTitle={offer.title} />
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-border/60 pt-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              setLiked((prev) => !prev);
              setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
            }}
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-primary",
              liked && "text-primary",
            )}
            aria-pressed={liked}
          >
            <Heart className={cn("size-4", liked && "fill-current")} aria-hidden="true" />
            {likeCount}
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="size-4" aria-hidden="true" />
            {post.comments}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
