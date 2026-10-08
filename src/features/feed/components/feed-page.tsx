"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "react-intersection-observer";
import { PostService, Post, PostComment } from "@/lib/services/post-service";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface FeedPageProps {
  currentUserId?: string;
}

export function FeedPage({ currentUserId }: FeedPageProps) {
  const t = useTranslations("Feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Map<string, PostComment[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  // Load more posts when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts();
    }
  }, [inView, hasMore, isLoading]);

  const loadPosts = async () => {
    setIsLoading(true);
    setHasError(false);
    const result = await PostService.listPosts(currentUserId, 10, 0);
    if (result.ok) {
      setPosts(result.data);
      setOffset(10);
      setHasMore(result.data.length === 10);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  const loadMorePosts = async () => {
    setIsLoading(true);
    const result = await PostService.listPosts(currentUserId, 10, offset);
    if (result.ok) {
      setPosts((prev) => [...prev, ...result.data]);
      setOffset((prev) => prev + 10);
      setHasMore(result.data.length === 10);
    }
    setIsLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) return;
    const result = await PostService.likePost({
      postId,
      userId: currentUserId,
    });
    if (result.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? result.data : p))
      );
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!currentUserId) return;
    const result = await PostService.commentPost({
      postId,
      userId: currentUserId,
      content,
    });
    if (result.ok) {
      // Update comment count in post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: p.comments + 1 }
            : p
        )
      );
      // Load comments for this post
      const commentsResult = await PostService.getPostComments(postId);
      if (commentsResult.ok) {
        setComments((prev) => new Map(prev).set(postId, commentsResult.data));
      }
    }
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log("Share post:", postId);
  };

  const handleExpandComments = useCallback(async (postId: string) => {
    if (!comments.has(postId)) {
      const result = await PostService.getPostComments(postId);
      if (result.ok) {
        setComments((prev) => new Map(prev).set(postId, result.data));
      }
    }
  }, [comments]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (hasError && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("error")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
            {t("errorDescription")}
          </p>
          <Button onClick={loadPosts} variant="outline">
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t("empty")}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            showComments={comments.has(post.id)}
            comments={comments.get(post.id) || []}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("loadingMore")}
            </p>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("endOfFeed")}
          </p>
        </div>
      )}
    </div>
  );
}
