"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Post, PostComment } from "@/lib/services/post-service";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onShare?: (postId: string) => void;
  showComments?: boolean;
  comments?: PostComment[];
}

export function PostCard({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  showComments = false,
  comments = [],
}: PostCardProps) {
  const t = useTranslations("Feed");
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    onComment?.(post.id, commentText);
    setCommentText("");
    setIsSubmitting(false);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const authorLabel =
    post.authorType === "athlete"
      ? "Athlete"
      : "Organization";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
        {post.authorAvatarUrl ? (
          <Image
            src={post.authorAvatarUrl}
            alt={post.authorName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {post.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {post.authorName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {authorLabel} • {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        {post.kind === "job" && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold rounded">
            {t("jobPosting")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-4 relative w-full bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden aspect-video">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-b border-slate-200 dark:border-slate-700">
        <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {post.likes} {t("likes")}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {post.comments} {t("comments")}
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
          onClick={handleLike}
        >
          <Heart
            className="w-4 h-4"
            fill={post.isLikedByCurrentUser ? "currentColor" : "none"}
            color={post.isLikedByCurrentUser ? "rgb(239, 68, 68)" : "currentColor"}
          />
          <span className="text-xs">{t("like")}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{t("comment")}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-green-500 dark:hover:text-green-400"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-xs">{t("share")}</span>
        </Button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
          {/* Comment List */}
          {comments.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  {comment.authorAvatarUrl ? (
                    <Image
                      src={comment.authorAvatarUrl}
                      alt={comment.authorName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {comment.authorName}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                      {comment.content}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          {currentUserId && (
            <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder={t("writeComment")}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("send")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
