/**
 * PostService: gestion du fil d'actualité (posts, likes, comments)
 * Bascule automatique mock ↔ Supabase via NEXT_PUBLIC_DEMO_MODE
 */

import { ServiceResult, ok, err, isDemoMode } from "./core";
import { MOCK_FEED_POSTS, MockFeedPost } from "@/lib/mock/feed";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Post {
  id: string;
  authorType: "athlete" | "organization";
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  kind: "photo" | "achievement" | "job" | "text";
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  offerId?: string;
  isLikedByCurrentUser?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface CreatePostInput {
  authorId: string;
  authorType: "athlete" | "organization";
  kind: "photo" | "achievement" | "job" | "text";
  content: string;
  imageUrl?: string;
  offerId?: string;
}

export interface LikePostInput {
  postId: string;
  userId: string;
}

export interface CommentPostInput {
  postId: string;
  userId: string;
  content: string;
}

// Mapping: enrich MockFeedPost → Post
function enrichPost(mockPost: MockFeedPost, authorName: string, authorAvatarUrl?: string): Post {
  return {
    id: mockPost.id,
    authorType: mockPost.authorType,
    authorId: mockPost.authorId,
    authorName,
    authorAvatarUrl,
    kind: mockPost.kind,
    content: mockPost.content,
    imageUrl: mockPost.imageUrl,
    createdAt: mockPost.createdAt,
    likes: mockPost.likes,
    comments: mockPost.comments,
    offerId: mockPost.offerId,
  };
}

// ============ DEMO MODE ============

const demoPostLikes = new Map<string, Set<string>>(); // postId → Set of userIds
const demoPostComments = new Map<string, PostComment[]>(); // postId → comments

function getDemoPost(postId: string, userId?: string): Post | null {
  const mockPost = MOCK_FEED_POSTS.find((p) => p.id === postId);
  if (!mockPost) return null;

  // Dynamically fetch author info (this would come from athletes/organizations in real app)
  const authorName =
    mockPost.authorType === "athlete"
      ? `Athlete ${mockPost.authorId}`
      : `Organization ${mockPost.authorId}`;

  const post = enrichPost(mockPost, authorName);
  if (userId) {
    post.isLikedByCurrentUser = demoPostLikes.get(postId)?.has(userId) ?? false;
  }
  return post;
}

function getDemoPosts(userId?: string): Post[] {
  return MOCK_FEED_POSTS.map((mockPost) => {
    const authorName =
      mockPost.authorType === "athlete"
        ? `Athlete ${mockPost.authorId}`
        : `Organization ${mockPost.authorId}`;
    const post = enrichPost(mockPost, authorName);
    if (userId) {
      post.isLikedByCurrentUser = demoPostLikes.get(post.id)?.has(userId) ?? false;
    }
    return post;
  });
}

// ============ REAL MODE (Supabase) ============

async function getSupabasePosts(
  userId?: string,
  limit = 20,
  offset = 0
): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();

  // In real implementation, join posts with athletes/organizations tables
  // For now, return empty (migration needed)
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return (posts || []).map((p: any) => ({
    id: p.id,
    authorType: p.author_type,
    authorId: p.author_id,
    authorName: p.author_name || "Unknown",
    authorAvatarUrl: p.author_avatar_url,
    kind: p.kind,
    content: p.content,
    imageUrl: p.image_url,
    createdAt: p.created_at,
    likes: p.likes || 0,
    comments: p.comments || 0,
    offerId: p.offer_id,
    isLikedByCurrentUser: userId ? p.liked_by?.includes(userId) : false,
  }));
}

async function getSupabasePost(postId: string, userId?: string): Promise<Post | null> {
  const supabase = createSupabaseBrowserClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    return null;
  }

  return {
    id: post.id,
    authorType: post.author_type,
    authorId: post.author_id,
    authorName: post.author_name || "Unknown",
    authorAvatarUrl: post.author_avatar_url,
    kind: post.kind,
    content: post.content,
    imageUrl: post.image_url,
    createdAt: post.created_at,
    likes: post.likes || 0,
    comments: post.comments || 0,
    offerId: post.offer_id,
    isLikedByCurrentUser: userId ? post.liked_by?.includes(userId) : false,
  };
}

// ============ PUBLIC API ============

export class PostService {
  /**
   * Récupère tous les posts du fil (mode demo: mock, mode réel: Supabase)
   */
  static async listPosts(
    userId?: string,
    limit = 20,
    offset = 0
  ): Promise<ServiceResult<Post[]>> {
    try {
      if (isDemoMode()) {
        return ok(getDemoPosts(userId).slice(offset, offset + limit));
      }

      const posts = await getSupabasePosts(userId, limit, offset);
      return ok(posts);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to list posts",
        "LIST_POSTS_ERROR"
      );
    }
  }

  /**
   * Récupère un post spécifique
   */
  static async getPost(postId: string, userId?: string): Promise<ServiceResult<Post | null>> {
    try {
      if (isDemoMode()) {
        const post = getDemoPost(postId, userId);
        return ok(post);
      }

      const post = await getSupabasePost(postId, userId);
      return ok(post);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get post",
        "GET_POST_ERROR"
      );
    }
  }

  /**
   * Crée un nouveau post (mode démo: mock, mode réel: insert Supabase)
   */
  static async createPost(input: CreatePostInput): Promise<ServiceResult<Post>> {
    try {
      if (isDemoMode()) {
        // Demo: créer un post mock temporaire
        const newPost: Post = {
          id: `post-${Date.now()}`,
          authorType: input.authorType,
          authorId: input.authorId,
          authorName: `${input.authorType} ${input.authorId}`,
          kind: input.kind,
          content: input.content,
          imageUrl: input.imageUrl,
          createdAt: new Date().toISOString(),
          likes: 0,
          comments: 0,
          offerId: input.offerId,
          isLikedByCurrentUser: false,
        };
        return ok(newPost);
      }

      const supabase = createSupabaseBrowserClient();
      const { data: post, error } = await supabase
        .from("posts")
        .insert([
          {
            author_id: input.authorId,
            author_type: input.authorType,
            kind: input.kind,
            content: input.content,
            image_url: input.imageUrl,
            offer_id: input.offerId,
            likes: 0,
            comments: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message, "CREATE_POST_ERROR");
      }

      return ok({
        id: post.id,
        authorType: post.author_type,
        authorId: post.author_id,
        authorName: post.author_name || "Unknown",
        authorAvatarUrl: post.author_avatar_url,
        kind: post.kind,
        content: post.content,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likes: post.likes || 0,
        comments: post.comments || 0,
        offerId: post.offer_id,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to create post",
        "CREATE_POST_ERROR"
      );
    }
  }

  /**
   * Toggle like sur un post
   */
  static async likePost(input: LikePostInput): Promise<ServiceResult<Post>> {
    try {
      if (isDemoMode()) {
        const postId = input.postId;
        const userId = input.userId;

        if (!demoPostLikes.has(postId)) {
          demoPostLikes.set(postId, new Set());
        }

        const likes = demoPostLikes.get(postId)!;
        let updatedLikes = 0;

        if (likes.has(userId)) {
          likes.delete(userId);
        } else {
          likes.add(userId);
        }

        // Update likes count in mock post
        const mockPost = MOCK_FEED_POSTS.find((p) => p.id === postId);
        if (mockPost) {
          updatedLikes = likes.size;
          mockPost.likes = updatedLikes;
        }

        const post = getDemoPost(postId, userId);
        return ok(post!);
      }

      const supabase = createSupabaseBrowserClient();
      const { data: post, error } = await supabase.rpc("toggle_post_like", {
        post_id: input.postId,
        user_id: input.userId,
      });

      if (error) {
        return err(error.message, "LIKE_POST_ERROR");
      }

      return ok(post as Post);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to like post",
        "LIKE_POST_ERROR"
      );
    }
  }

  /**
   * Ajoute un commentaire à un post
   */
  static async commentPost(input: CommentPostInput): Promise<ServiceResult<PostComment>> {
    try {
      if (isDemoMode()) {
        const comment: PostComment = {
          id: `comment-${Date.now()}`,
          postId: input.postId,
          authorId: input.userId,
          authorName: `User ${input.userId}`,
          content: input.content,
          createdAt: new Date().toISOString(),
        };

        if (!demoPostComments.has(input.postId)) {
          demoPostComments.set(input.postId, []);
        }
        demoPostComments.get(input.postId)!.push(comment);

        // Update comment count in mock post
        const mockPost = MOCK_FEED_POSTS.find((p) => p.id === input.postId);
        if (mockPost) {
          mockPost.comments = demoPostComments.get(input.postId)!.length;
        }

        return ok(comment);
      }

      const supabase = createSupabaseBrowserClient();
      const { data: comment, error } = await supabase
        .from("post_comments")
        .insert([
          {
            post_id: input.postId,
            author_id: input.userId,
            content: input.content,
          },
        ])
        .select()
        .single();

      if (error) {
        return err(error.message, "COMMENT_POST_ERROR");
      }

      return ok({
        id: comment.id,
        postId: comment.post_id,
        authorId: comment.author_id,
        authorName: comment.author_name || "Unknown",
        authorAvatarUrl: comment.author_avatar_url,
        content: comment.content,
        createdAt: comment.created_at,
      });
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to comment post",
        "COMMENT_POST_ERROR"
      );
    }
  }

  /**
   * Récupère les commentaires d'un post
   */
  static async getPostComments(postId: string): Promise<ServiceResult<PostComment[]>> {
    try {
      if (isDemoMode()) {
        const comments = demoPostComments.get(postId) || [];
        return ok(comments);
      }

      const supabase = createSupabaseBrowserClient();
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        return err(error.message, "GET_COMMENTS_ERROR");
      }

      return ok(
        (comments || []).map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          authorName: c.author_name || "Unknown",
          authorAvatarUrl: c.author_avatar_url,
          content: c.content,
          createdAt: c.created_at,
        }))
      );
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get comments",
        "GET_COMMENTS_ERROR"
      );
    }
  }
}
