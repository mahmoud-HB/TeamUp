/**
 * TeamsService: gestion des équipes de recrutement
 * Mode démo uniquement pour MVP
 */

import { ServiceResult, ok, err, isDemoMode } from "./index";

export interface Team {
  id: string;
  name: string;
  description: string;
  recruiter_id: string;
  member_count: number;
  created_at: string;
}

const MOCK_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Arsenal Talents',
    description: 'Leading recruitment team for elite athletes',
    recruiter_id: 'recruiter-1',
    member_count: 3,
    created_at: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'team-2',
    name: 'Paris United Scouts',
    description: 'European scouting network for football talents',
    recruiter_id: 'recruiter-2',
    member_count: 5,
    created_at: new Date('2024-02-01').toISOString(),
  },
];

export const TeamsService = {
  async listTeams(): Promise<ServiceResult<Team[]>> {
    return ok(MOCK_TEAMS);
  },

  async getTeam(teamId: string): Promise<ServiceResult<Team>> {
    const team = MOCK_TEAMS.find((t) => t.id === teamId);
    return team ? ok(team) : err('Team not found');
  },

  async createTeam(input: Partial<Team>): Promise<ServiceResult<Team>> {
    const team: Team = {
      id: `team-${Date.now()}`,
      name: input.name || 'Untitled',
      description: input.description || '',
      recruiter_id: input.recruiter_id || '',
      member_count: 1,
      created_at: new Date().toISOString(),
    };
    MOCK_TEAMS.push(team);
    return ok(team);
  },
};
