/**
 * FollowService: gestion du réseau (follow, followers, following)
 * Bascule automatique mock ↔ Supabase via NEXT_PUBLIC_DEMO_MODE
 */

import { ServiceResult, ok, err, isDemoMode } from "./core";
import { MOCK_ATHLETES } from "@/lib/mock/athletes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  country?: string;
  bio?: string;
  verified?: boolean;
  currentClub?: string;
  isFollowing?: boolean; // Current user follows this person?
  isFollowedBy?: boolean; // This person follows current user?
  followerCount?: number;
  followingCount?: number;
}

export interface FollowSuggestion extends UserProfile {
  mutualFollows?: number; // Nombre de followers en commun
  reason?: string; // Pourquoi suggéré ("Same sport", "Popular in your country", etc.)
}

// ============ DEMO MODE ============

const demoFollows = new Map<string, Set<string>>(); // userId → Set of following IDs

function getUserProfile(userId: string, currentUserId?: string): UserProfile | null {
  const athlete = MOCK_ATHLETES.find((a) => a.id === userId);
  if (!athlete) return null;

  const followers = new Set<string>();
  demoFollows.forEach((following, uid) => {
    if (following.has(userId)) followers.add(uid);
  });

  return {
    id: athlete.id,
    username: athlete.username,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    avatarUrl: athlete.avatarUrl,
    country: athlete.country,
    bio: athlete.bio,
    verified: athlete.verified,
    currentClub: athlete.currentClub,
    isFollowing: currentUserId ? demoFollows.get(currentUserId)?.has(userId) ?? false : false,
    isFollowedBy: currentUserId ? followers.has(currentUserId) : false,
    followerCount: followers.size,
    followingCount: demoFollows.get(userId)?.size ?? 0,
  };
}

function getFollowSuggestions(userId: string): FollowSuggestion[] {
  const currentFollowing = demoFollows.get(userId) || new Set();
  const currentFollowers = new Set<string>();
  demoFollows.forEach((following, uid) => {
    if (following.has(userId)) currentFollowers.add(uid);
  });

  // Suggest athletes not yet followed
  return MOCK_ATHLETES.filter((a) => a.id !== userId && !currentFollowing.has(a.id))
    .map((athlete) => {
      const followers = new Set<string>();
      demoFollows.forEach((following, uid) => {
        if (following.has(athlete.id)) followers.add(uid);
      });

      // Count mutual follows
      const mutualFollows = Array.from(followers).filter((id) =>
        currentFollowers.has(id)
      ).length;

      let reason = "";
      if (mutualFollows > 0) {
        reason = `${mutualFollows} follow${mutualFollows > 1 ? "s" : ""} in common`;
      } else if (athlete.country === MOCK_ATHLETES.find((a) => a.id === userId)?.country) {
        reason = "Same country";
      } else if (
        athlete.sports[0]?.sportSlug ===
        MOCK_ATHLETES.find((a) => a.id === userId)?.sports[0]?.sportSlug
      ) {
        reason = "Same sport";
      }

      return {
        id: athlete.id,
        username: athlete.username,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        avatarUrl: athlete.avatarUrl,
        country: athlete.country,
        bio: athlete.bio,
        verified: athlete.verified,
        currentClub: athlete.currentClub,
        isFollowing: currentFollowing.has(athlete.id),
        isFollowedBy: currentFollowers.has(athlete.id),
        followerCount: followers.size,
        followingCount: demoFollows.get(athlete.id)?.size ?? 0,
        mutualFollows,
        reason,
      };
    })
    .sort((a, b) => (b.mutualFollows || 0) - (a.mutualFollows || 0))
    .slice(0, 12); // Top 12 suggestions
}

// ============ REAL MODE (Supabase) ============

async function getSupabaseUserProfile(
  userId: string,
  currentUserId?: string
): Promise<UserProfile | null> {
  const supabase = createSupabaseBrowserClient();

  const { data: profile, error } = await supabase
    .from("athlete_profiles")
    .select(
      `id, username, first_name, last_name, avatar_url, country, bio, 
       verified, current_club,
       follower_count, following_count`
    )
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return null;
  }

  let isFollowing = false;
  let isFollowedBy = false;

  if (currentUserId) {
    const followResult = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", userId)
      .single();

    isFollowing = !followResult.error;

    const followerResult = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", currentUserId)
      .single();

    isFollowedBy = !followerResult.error;
  }

  return {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url,
    country: profile.country,
    bio: profile.bio,
    verified: profile.verified,
    currentClub: profile.current_club,
    isFollowing,
    isFollowedBy,
    followerCount: profile.follower_count || 0,
    followingCount: profile.following_count || 0,
  };
}

async function getSupabaseFollowSuggestions(userId: string): Promise<FollowSuggestion[]> {
  const supabase = createSupabaseBrowserClient();

  // Get athletes user already follows
  const { data: following } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = new Set((following || []).map((f: any) => f.following_id));

  // Get suggestions: athletes with most mutual followers
  const { data: suggestions, error } = await supabase
    .from("athlete_profiles")
    .select(
      `id, username, first_name, last_name, avatar_url, country, bio, 
       verified, current_club, follower_count, following_count`
    )
    .neq("id", userId)
    .limit(20);

  if (error || !suggestions) {
    return [];
  }

  // Map to FollowSuggestion
  return suggestions
    .filter((s: any) => !followingIds.has(s.id))
    .map((athlete: any) => ({
      id: athlete.id,
      username: athlete.username,
      firstName: athlete.first_name,
      lastName: athlete.last_name,
      avatarUrl: athlete.avatar_url,
      country: athlete.country,
      bio: athlete.bio,
      verified: athlete.verified,
      currentClub: athlete.current_club,
      followerCount: athlete.follower_count || 0,
      followingCount: athlete.following_count || 0,
      isFollowing: false,
    }))
    .slice(0, 12);
}

// ============ PUBLIC API ============

export class FollowService {
  /**
   * Follow an athlete
   */
  static async follow(userId: string, targetId: string): Promise<ServiceResult<UserProfile | null>> {
    try {
      if (isDemoMode()) {
        if (!demoFollows.has(userId)) {
          demoFollows.set(userId, new Set());
        }
        demoFollows.get(userId)!.add(targetId);

        const profile = getUserProfile(targetId, userId);
        return ok(profile);
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("user_follows").insert([
        {
          follower_id: userId,
          following_id: targetId,
        },
      ]);

      if (error) {
        return err(error.message, "FOLLOW_ERROR");
      }

      const profile = await getSupabaseUserProfile(targetId, userId);
      return ok(profile);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to follow user",
        "FOLLOW_ERROR"
      );
    }
  }

  /**
   * Unfollow an athlete
   */
  static async unfollow(userId: string, targetId: string): Promise<ServiceResult<UserProfile | null>> {
    try {
      if (isDemoMode()) {
        demoFollows.get(userId)?.delete(targetId);
        const profile = getUserProfile(targetId, userId);
        return ok(profile);
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", userId)
        .eq("following_id", targetId);

      if (error) {
        return err(error.message, "UNFOLLOW_ERROR");
      }

      const profile = await getSupabaseUserProfile(targetId, userId);
      return ok(profile);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to unfollow user",
        "UNFOLLOW_ERROR"
      );
    }
  }

  /**
   * Get user profile with follow status
   */
  static async getUserProfile(
    userId: string,
    currentUserId?: string
  ): Promise<ServiceResult<UserProfile | null>> {
    try {
      if (isDemoMode()) {
        const profile = getUserProfile(userId, currentUserId);
        return ok(profile);
      }

      const profile = await getSupabaseUserProfile(userId, currentUserId);
      return ok(profile);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get user profile",
        "GET_PROFILE_ERROR"
      );
    }
  }

  /**
   * Get follow suggestions for current user
   */
  static async getFollowSuggestions(userId: string): Promise<ServiceResult<FollowSuggestion[]>> {
    try {
      if (isDemoMode()) {
        const suggestions = getFollowSuggestions(userId);
        return ok(suggestions);
      }

      const suggestions = await getSupabaseFollowSuggestions(userId);
      return ok(suggestions);
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get suggestions",
        "GET_SUGGESTIONS_ERROR"
      );
    }
  }

  /**
   * Get list of followers
   */
  static async getFollowers(userId: string, limit = 20): Promise<ServiceResult<UserProfile[]>> {
    try {
      if (isDemoMode()) {
        const followers = new Set<string>();
        demoFollows.forEach((following, uid) => {
          if (following.has(userId)) followers.add(uid);
        });

        const profiles = Array.from(followers)
          .map((id) => getUserProfile(id, userId))
          .filter((p) => p !== null) as UserProfile[];

        return ok(profiles.slice(0, limit));
      }

      const supabase = createSupabaseBrowserClient();
      const { data: follows } = await supabase
        .from("user_follows")
        .select("follower_id")
        .eq("following_id", userId)
        .limit(limit);

      const followerIds = (follows || []).map((f: any) => f.follower_id);

      if (followerIds.length === 0) {
        return ok([]);
      }

      const { data: profiles } = await supabase
        .from("athlete_profiles")
        .select("*")
        .in("id", followerIds);

      return ok(
        (profiles || []).map((p: any) => ({
          id: p.id,
          username: p.username,
          firstName: p.first_name,
          lastName: p.last_name,
          avatarUrl: p.avatar_url,
          country: p.country,
          bio: p.bio,
          verified: p.verified,
          currentClub: p.current_club,
        }))
      );
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get followers",
        "GET_FOLLOWERS_ERROR"
      );
    }
  }

  /**
   * Get list of users this person is following
   */
  static async getFollowing(userId: string, limit = 20): Promise<ServiceResult<UserProfile[]>> {
    try {
      if (isDemoMode()) {
        const following = demoFollows.get(userId) || new Set();
        const profiles = Array.from(following)
          .map((id) => getUserProfile(id, userId))
          .filter((p) => p !== null) as UserProfile[];

        return ok(Array.from(profiles).slice(0, limit));
      }

      const supabase = createSupabaseBrowserClient();
      const { data: follows } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", userId)
        .limit(limit);

      const followingIds = (follows || []).map((f: any) => f.following_id);

      if (followingIds.length === 0) {
        return ok([]);
      }

      const { data: profiles } = await supabase
        .from("athlete_profiles")
        .select("*")
        .in("id", followingIds);

      return ok(
        (profiles || []).map((p: any) => ({
          id: p.id,
          username: p.username,
          firstName: p.first_name,
          lastName: p.last_name,
          avatarUrl: p.avatar_url,
          country: p.country,
          bio: p.bio,
          verified: p.verified,
          currentClub: p.current_club,
        }))
      );
    } catch (error) {
      return err(
        error instanceof Error ? error.message : "Failed to get following",
        "GET_FOLLOWING_ERROR"
      );
    }
  }
}
