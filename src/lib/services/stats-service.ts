/**
 * StatsService: Analytics & stats personnelles pour joueur/recruteur
 * Répartition: profile views, network stats, offer stats, gaming stats, trends
 */

import { ServiceResult, ok, err, isDemoMode } from "./index";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AthleteStats {
  userId: string;
  profileViews: number;
  profileViewsThisMonth: number;
  profileCompletion: number; // 0-100%
  recruiterInterest: number; // count
  connectionsCount: number;
  followersCount: number;
  teamMemberships: number;
  averageRating: number; // 1-5
}

export interface GamingStats {
  favoriteGames: Array<{
    gameSlug: string;
    gameName: string;
    hoursPlayed: number;
    rank: string;
    winrate: number;
    mainChampion?: string;
    achievements: number;
  }>;
  totalHoursPlayed: number;
  achievements: string[];
  tournaments: number;
  victories: number;
}

export interface RecruitmentStats {
  offersReceived: number;
  applicationsSubmitted: number;
  acceptedOffers: number;
  viewedOffers: number;
  teamJoinRate: number; // % of offers accepted
  avgResponseTime: number; // hours
}

export interface NetworkStats {
  connections: number;
  followers: number;
  following: number;
  mutualConnections: number;
  newConnectionsThisMonth: number;
  messages: number;
  conversations: number;
}

export interface TrendData {
  date: string;
  views: number;
  applications: number;
  messages: number;
  engagementScore: number;
}

export interface DashboardStats {
  athlete: AthleteStats;
  gaming: GamingStats;
  recruitment: RecruitmentStats;
  network: NetworkStats;
  trends: TrendData[]; // 30 jours
  insights: string[];
}

// ============ MOCK DATA ============

const MOCK_GAMING_STATS: Record<string, GamingStats> = {
  "ath-001": {
    favoriteGames: [
      {
        gameSlug: "valorant",
        gameName: "Valorant",
        hoursPlayed: 1240,
        rank: "Radiant",
        winrate: 58.2,
        mainChampion: "Jett",
        achievements: 5,
      },
      {
        gameSlug: "cs2",
        gameName: "Counter-Strike 2",
        hoursPlayed: 890,
        rank: "Legendary Eagle Master",
        winrate: 54.1,
        achievements: 3,
      },
    ],
    totalHoursPlayed: 2130,
    achievements: [
      "First Blood",
      "Ace Clutch",
      "Tournament Winner 2024",
      "Ranked Grind 1K hours",
      "Community Leader",
    ],
    tournaments: 12,
    victories: 8,
  },
};

const MOCK_STATS_CACHE: Map<string, DashboardStats> = new Map();

function generateMockStats(userId: string): DashboardStats {
  const cached = MOCK_STATS_CACHE.get(userId);
  if (cached) return cached;

  const now = new Date();
  const trends: TrendData[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split("T")[0],
      views: Math.floor(Math.random() * 50) + 5,
      applications: Math.floor(Math.random() * 10),
      messages: Math.floor(Math.random() * 20),
      engagementScore: Math.floor(Math.random() * 100),
    });
  }

  const stats: DashboardStats = {
    athlete: {
      userId,
      profileViews: Math.floor(Math.random() * 500) + 50,
      profileViewsThisMonth: Math.floor(Math.random() * 150) + 20,
      profileCompletion: Math.floor(Math.random() * 30) + 70,
      recruiterInterest: Math.floor(Math.random() * 20) + 2,
      connectionsCount: Math.floor(Math.random() * 200) + 10,
      followersCount: Math.floor(Math.random() * 300) + 20,
      teamMemberships: Math.floor(Math.random() * 5) + 1,
      averageRating: Math.random() * 2 + 3.5,
    },
    gaming:
      MOCK_GAMING_STATS[userId] || {
        favoriteGames: [
          {
            gameSlug: "valorant",
            gameName: "Valorant",
            hoursPlayed: Math.floor(Math.random() * 2000) + 100,
            rank: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Radiant"][
              Math.floor(Math.random() * 8)
            ],
            winrate: Math.random() * 30 + 40,
            mainChampion: ["Jett", "Phoenix", "Reyna", "Viper"][Math.floor(Math.random() * 4)],
            achievements: Math.floor(Math.random() * 8) + 1,
          },
        ],
        totalHoursPlayed: Math.floor(Math.random() * 3000) + 500,
        achievements: ["First Win", "Kill Streak", "Team Player", "Rising Star"],
        tournaments: Math.floor(Math.random() * 15),
        victories: Math.floor(Math.random() * 10),
      },
    recruitment: {
      offersReceived: Math.floor(Math.random() * 15) + 2,
      applicationsSubmitted: Math.floor(Math.random() * 25) + 3,
      acceptedOffers: Math.floor(Math.random() * 5),
      viewedOffers: Math.floor(Math.random() * 50) + 10,
      teamJoinRate: Math.floor(Math.random() * 40) + 30,
      avgResponseTime: Math.floor(Math.random() * 36) + 2,
    },
    network: {
      connections: Math.floor(Math.random() * 200) + 10,
      followers: Math.floor(Math.random() * 300) + 20,
      following: Math.floor(Math.random() * 200) + 30,
      mutualConnections: Math.floor(Math.random() * 50) + 5,
      newConnectionsThisMonth: Math.floor(Math.random() * 30) + 2,
      messages: Math.floor(Math.random() * 100) + 5,
      conversations: Math.floor(Math.random() * 20) + 2,
    },
    trends,
    insights: [
      "Votre profil est vu 23% plus souvent ce mois-ci",
      "Vous recevez 15 demandes de connexion par semaine en moyenne",
      "Vos vidéos de gameplay génèrent 2.3x plus d'engagement",
      "Vous avez une compatibilité moyenne de 78% avec les postes recherchés",
      "Rejoindre une équipe pourrait augmenter vos opportunités de 45%",
    ],
  };

  MOCK_STATS_CACHE.set(userId, stats);
  return stats;
}

// ============ SERVICE API ============

export const StatsService = {
  async getDashboardStats(userId: string): Promise<ServiceResult<DashboardStats>> {
    if (!isDemoMode()) {
      // TODO: Connect to Supabase analytics tables
      const supabase = createSupabaseBrowserClient();
      // Implement real analytics queries here
      return ok(generateMockStats(userId));
    }

    return ok(generateMockStats(userId));
  },

  async getAthleteStats(userId: string): Promise<ServiceResult<AthleteStats>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.athlete);
  },

  async getGamingStats(userId: string): Promise<ServiceResult<GamingStats>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.gaming);
  },

  async getRecruitmentStats(userId: string): Promise<ServiceResult<RecruitmentStats>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.recruitment);
  },

  async getNetworkStats(userId: string): Promise<ServiceResult<NetworkStats>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.network);
  },

  async getTrends(userId: string, days: number = 30): Promise<ServiceResult<TrendData[]>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.trends.slice(-days));
  },

  async getInsights(userId: string): Promise<ServiceResult<string[]>> {
    const dashboard = await this.getDashboardStats(userId);
    if (!dashboard.ok) return err(dashboard.error, dashboard.code);
    return ok(dashboard.data.insights);
  },

  async refreshStats(userId: string): Promise<ServiceResult<null>> {
    MOCK_STATS_CACHE.delete(userId);
    return ok(null);
  },
};
