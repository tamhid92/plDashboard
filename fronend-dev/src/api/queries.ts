import { useQuery } from '@tanstack/react-query';
import { api } from './client';
import type { Standing, CompletedFixture, Fixture, Team, Player, WeeklyStanding } from './types';

export const useStandings = () => {
    return useQuery({
        queryKey: ['standings'],
        queryFn: async () => {
            const { data } = await api.get<Standing[]>('/standings');
            // Sort by position just in case, or points/GD/GF
            return data.sort((a, b) => a.position - b.position);
        },
    });
};

// Existing imports...
export const useCompletedFixtures = () => {
    return useQuery({
        queryKey: ['completedFixtures'],
        queryFn: async () => {
            const { data } = await api.get<CompletedFixture[]>('/completedFixtures');
            return data;
        },
    });
};

export const useCompletedMatchesByTeam = (teamId: number | string | undefined) => {
    return useQuery({
        queryKey: ['completedMatchesByTeam', teamId],
        queryFn: async () => {
            if (!teamId) return [];
            const { data } = await api.get<CompletedFixture[]>(`/completedGamebyTeamId/${teamId}`);
            return data;
        },
        enabled: !!teamId,
    });
};

export const useUpcomingFixtures = () => {
    return useQuery({
        queryKey: ['upcomingFixtures'],
        queryFn: async () => {
            const { data } = await api.get<Fixture[]>('/upcomingFixtures');
            return data;
        },
    });
};

// Helper to compute form (last 5 matches)
// Returns a map of teamId -> string[] (e.g. ['W', 'D', 'L', ...])
export const useTeamForm = () => {
    const { data: fixtures } = useCompletedFixtures();

    if (!fixtures) return {};

    const teamForm: Record<number, string[]> = {};

    // Sort fixtures by gameweek/date desc
    const sorted = [...fixtures].sort((a, b) =>
        new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime()
    );

    sorted.forEach(match => {
        // Process Home Team
        if (!teamForm[match.home_team_id]) teamForm[match.home_team_id] = [];
        if (teamForm[match.home_team_id].length < 5) {
            if (match.home_team_score > match.away_team_score) teamForm[match.home_team_id].push('W');
            else if (match.home_team_score === match.away_team_score) teamForm[match.home_team_id].push('D');
            else teamForm[match.home_team_id].push('L');
        }

        // Process Away Team
        if (!teamForm[match.away_team_id]) teamForm[match.away_team_id] = [];
        if (teamForm[match.away_team_id].length < 5) {
            if (match.away_team_score > match.home_team_score) teamForm[match.away_team_id].push('W');
            else if (match.away_team_score === match.home_team_score) teamForm[match.away_team_id].push('D');
            else teamForm[match.away_team_id].push('L');
        }
    });

    // Reverse to show oldest -> newest (Left to Right) or keep Newest -> Oldest? 
    // Standard is usually Left=Newest or Left=Oldest? 
    // Flashscore: Left is most recent. Wait, no. usually reading L->R is sequence. 
    // Let's store as [MostRecent, ..., Oldest] then reverse for display if needed.
    // Actually, standard is usually: [Oldest ... Newest]. 
    // My loop pushes Most Recent first. So [Recent, ..., Old].

    return teamForm;
};

export const useUpcomingGameweek = () => {
    return useQuery({
        queryKey: ['upcomingGameweek'],
        queryFn: async () => {
            const { data } = await api.get<{ gameweek: number }>('/upcomingGameweek');
            return data.gameweek;
        },
    });
};

export const useWeeklyStandings = () => {
    return useQuery({
        queryKey: ['weeklyTable'],
        queryFn: async () => {
            const { data } = await api.get<WeeklyStanding[]>('/weeklyTable');
            return data;
        },
        staleTime: 1000 * 60 * 30, // 30 mins, big dataset
    });
};

export const usePlayers = () => {
    return useQuery({
        queryKey: ['players'],
        queryFn: async () => {
            const { data } = await api.get<Player[]>('/players'); // Use Player[]
            return data.map((p) => {
                // Prioritize stats from Opta 'stats' object, fall back to 'fpl_stats'
                const goals = p.stats?.goals ?? p.fpl_stats?.goals_scored ?? 0;
                const assists = p.stats?.goalAssists ?? p.fpl_stats?.assists ?? 0;
                const minutes = p.stats?.timePlayed ?? p.fpl_stats?.minutes ?? 0;

                return {
                    ...p,
                    goals: Number(goals),
                    assists: Number(assists),
                    minutes_played: Number(minutes),
                } as Player;
            });
        },
    });
};

export const usePlayer = (playerId: number | string | undefined) => {
    return useQuery({
        queryKey: ['player', playerId],
        queryFn: async () => {
            if (!playerId) return null;
            const { data } = await api.get<Player | Player[]>(`/playersById/${playerId}`);
            // Handle array response
            const rawPlayer = Array.isArray(data) ? data[0] : data;

            if (!rawPlayer) return null;

            // Prioritize stats from Opta 'stats' object, fall back to 'fpl_stats'
            const goals = rawPlayer.stats?.goals ?? rawPlayer.fpl_stats?.goals_scored ?? 0;
            const assists = rawPlayer.stats?.goalAssists ?? rawPlayer.fpl_stats?.assists ?? 0;
            const minutes = rawPlayer.stats?.timePlayed ?? rawPlayer.fpl_stats?.minutes ?? 0;

            return {
                ...rawPlayer,
                goals: Number(goals),
                assists: Number(assists),
                minutes_played: Number(minutes),
            };
        },
        enabled: !!playerId,
    });
};

export const useTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get<Team[]>('/teams');
            return data;
        },
    });
};

export const useTeam = (teamId: number | string | undefined) => {
    return useQuery({
        queryKey: ['team', teamId],
        queryFn: async () => {
            if (!teamId) return null;
            const { data } = await api.get<Team[]>(`/teamsById/${teamId}`);
            // The API returns an array [{...}], we want the first item
            return data && data.length > 0 ? data[0] : null;
        },
        enabled: !!teamId,
    });
};
