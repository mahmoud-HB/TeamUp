import { TeamsService } from '@/lib/services/teams-service';

export default async function TeamsPage() {
  const result = await TeamsService.listTeams();
  const teams = result.ok ? result.data : [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold">Équipes de recrutement</h1>
        <p className="text-muted-foreground">Gérez vos équipes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="rounded-lg border p-4">
            <h3 className="font-semibold">{team.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{team.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">{team.member_count} members</p>
          </div>
        ))}
      </div>
    </div>
  );
}
