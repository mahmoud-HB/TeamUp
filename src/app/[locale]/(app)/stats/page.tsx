import { StatsService, type DashboardStats } from "@/lib/services/stats-service";
import { getAuth } from "@/lib/auth/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { User, TrendingUp, Target, Users, Activity, Award } from "lucide-react";

export default async function StatsPage({ params }: { params: { locale: string } }) {
  const auth = await getAuth();
  if (!auth || !auth.user) {
    return <div>Authentification requise</div>;
  }

  const result = await StatsService.getDashboardStats(auth.user.id);
  if (!result.ok) {
    return <div>Erreur lors du chargement des statistiques</div>;
  }

  const stats = result.data;
  const isEnglish = params.locale === "en";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isEnglish ? "Your Statistics" : "Vos Statistiques"}
          </h1>
          <p className="text-slate-300">
            {isEnglish
              ? "Track your profile performance and gaming achievements"
              : "Suivez la performance de votre profil et vos réalisations gaming"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<User className="w-6 h-6" />}
            title={isEnglish ? "Profile Views" : "Vues du profil"}
            value={stats.athlete.profileViews}
            subtitle={`${stats.athlete.profileViewsThisMonth} ${isEnglish ? "this month" : "ce mois"}`}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title={isEnglish ? "Completion" : "Complétude"}
            value={`${stats.athlete.profileCompletion}%`}
            subtitle={isEnglish ? "Profile done" : "Profil rempli"}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title={isEnglish ? "Recruiter Interest" : "Intérêt recruteur"}
            value={stats.athlete.recruiterInterest}
            subtitle={isEnglish ? "Looking at you" : "qui vous regardent"}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title={isEnglish ? "Connections" : "Connexions"}
            value={stats.network.connections}
            subtitle={`+${stats.network.newConnectionsThisMonth} ${isEnglish ? "this month" : "ce mois"}`}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Gaming Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {isEnglish ? "Gaming Stats" : "Stats Gaming"}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-300">
                    {isEnglish ? "Total Hours" : "Heures totales"}
                  </span>
                  <span className="text-2xl font-bold text-white">
                    {stats.gaming.totalHoursPlayed.toLocaleString()}h
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-300">
                    {isEnglish ? "Tournaments" : "Tournois"}
                  </span>
                  <span className="text-2xl font-bold text-white">{stats.gaming.tournaments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">
                    {isEnglish ? "Victories" : "Victoires"}
                  </span>
                  <span className="text-2xl font-bold text-white">{stats.gaming.victories}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                {isEnglish ? "Top Games" : "Jeux favoris"}
              </h3>
              <div className="space-y-2">
                {stats.gaming.favoriteGames.map((game, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-slate-300 truncate">{game.gameName}</span>
                    <span className="text-sm font-semibold text-amber-400">{game.rank}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Trends - Simple version without Recharts */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {isEnglish ? "Engagement Trend (30 days)" : "Tendance d'engagement (30 jours)"}
            </h2>
            <div className="space-y-3">
              {stats.trends.slice(-7).map((day, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 w-20">{day.date}</span>
                  <div className="flex-1 mx-4 bg-slate-700 rounded h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded"
                      style={{ width: `${Math.min(day.engagementScore, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-12">{day.engagementScore}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {isEnglish ? "AI Insights" : "Insights IA"}
            </h3>
            <ul className="space-y-2">
              {stats.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-200">
                  <span className="text-indigo-400 mt-1">💡</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href={`/${params.locale}/recruitment-advisor`}
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition"
          >
            {isEnglish ? "Find Your Next Team →" : "Trouvez votre prochaine équipe →"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: any;
  subtitle: string;
  color: string;
}) {
  return (
    <Card className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50 hover:border-slate-500/50 transition">
      <div className="p-6">
        <div className={`inline-block p-3 bg-gradient-to-br ${color} rounded-lg mb-4`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">{title}</h3>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </Card>
  );
}
