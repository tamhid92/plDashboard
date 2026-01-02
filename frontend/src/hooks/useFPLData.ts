
import { useMemo } from 'react';
import { usePlayers, useTeams, useUpcomingFixtures } from '../api/queries';
import type { Player, Team, Fixture } from '../api/types';

export interface FPLPlayer extends Player {
    // Enriched Data
    team_name: string;
    team_abbr: string;

    // Derived Metrics (Descriptive Only)
    derived: {
        now_cost: number; // Scaled (e.g., 105 -> 10.5)
        total_points: number;
        points_per_game: number;
        points_per_90: number; // New: Per 90 metric
        last_gameweek_points: number; // Actual event points

        form: number; // Last 30 days avg
        ict_index: number;

        selected_by_percent: number;
        minutes_per_game: number;

        value_season: number; // Points per million
        value_form: number;   // Form per million
        performance_index: number; // Form * 0.6 + PPG * 0.4

        // Context
        next_opponent_id?: number | null;
        next_opponent_name?: string;
        next_opponent_abbr?: string;
        next_opponent_difficulty: number; // 1-5 Scale

        // Availability
        is_available: boolean;
        chance_of_playing: number;
        news: string;
    };
}

export interface FPLDataResult {
    players: FPLPlayer[];
    teams: Team[];
    gameweek: number | null;
    loading: boolean;
    stats: {
        top_scorer: FPLPlayer | null;
        top_value: FPLPlayer | null;
        most_owned: FPLPlayer | null;
        top_performers: FPLPlayer[];
    };
}

export const useFPLData = (): FPLDataResult => {
    const { data: players, isLoading: playersLoading } = usePlayers();
    const { data: teams, isLoading: teamsLoading } = useTeams();
    // Use upcoming fixtures (which filters for uncompleted)
    const { data: fixtures, isLoading: fixturesLoading } = useUpcomingFixtures();

    const result = useMemo(() => {
        if (!players || !teams) {
            return { players: [], teams: [], gameweek: null, loading: true, stats: { top_scorer: null, top_value: null, most_owned: null, top_performers: [] } };
        }

        // 1. Identify Next Gameweek & Opponents
        const nextGw = fixtures?.length ? Math.min(...fixtures.map(f => f.gameweek)) : null;

        const nextOpponentMap: Record<number, number> = {};
        if (fixtures && nextGw) {
            fixtures.filter(f => f.gameweek === nextGw).forEach(f => {
                nextOpponentMap[f.home_team_id] = f.away_team_id;
                nextOpponentMap[f.away_team_id] = f.home_team_id;
            });
        }

        // 2. Enhance Players
        const enhancedPlayers: FPLPlayer[] = players.map(p => {
            const team = teams.find(t => t.id === p.team_id);
            const teamName = team ? team.name : 'Unknown';
            const teamAbbr = team ? team.abbr : '???';

            const fpl = p.fpl_stats;
            // Safe conversions and extraction
            const safeFloat = (val: string | number | undefined) => {
                if (val === undefined || val === null) return 0;
                const num = typeof val === 'string' ? parseFloat(val) : val;
                return isNaN(num) ? 0 : num;
            };

            const now_cost = fpl ? fpl.now_cost / 10 : 0;
            const ppg = fpl ? safeFloat(fpl.points_per_game) : 0;
            const form = fpl ? safeFloat(fpl.form) : 0;
            const ict = fpl ? safeFloat(fpl.ict_index) : 0;
            const selected = fpl ? safeFloat(fpl.selected_by_percent) : 0;
            const total_points = (fpl && !isNaN(fpl.total_points)) ? fpl.total_points : 0;
            const event_points = fpl ? fpl.event_points : 0;
            const minutes = fpl ? fpl.minutes : 0;
            const chance = fpl?.chance_of_playing_next_round ?? 100;
            const status = fpl?.status ?? 'a';
            const news = fpl?.news || "";

            // Derived Descriptive Metrics
            const appearances = p.stats?.appearances || 1;
            const avgMins = minutes / (appearances || 1);

            // Points per 90 (Guard against 0 minutes)
            let pp90 = minutes > 0 ? (total_points / minutes) * 90 : 0;
            if (isNaN(pp90) || !isFinite(pp90)) pp90 = 0;

            // Value metrics
            let value_season = now_cost > 0 ? total_points / now_cost : 0;
            if (isNaN(value_season) || !isFinite(value_season)) value_season = 0;

            let value_form = now_cost > 0 ? form / now_cost : 0;
            if (isNaN(value_form) || !isFinite(value_form)) value_form = 0;

            // Performance Index: Form (60%) + PPG (40%)
            const perfScore = (form * 0.6) + (ppg * 0.4);

            // Opponent Logic
            const nextOppId = nextOpponentMap[p.team_id] || null;
            const nextOppTeam = nextOppId ? teams.find(t => t.id === nextOppId) : null;
            let diffRating = 3;

            // Use strength data if available for context
            if (nextOppTeam && team) {
                // Simple diff placeholder
                diffRating = 3;
            }

            return {
                ...p,
                team_name: teamName,
                team_abbr: teamAbbr,
                derived: {
                    now_cost,
                    total_points,
                    points_per_game: ppg,
                    points_per_90: parseFloat(pp90.toFixed(2)),
                    last_gameweek_points: event_points,

                    form,
                    ict_index: ict,

                    selected_by_percent: selected,
                    minutes_per_game: avgMins,
                    value_season: parseFloat(value_season.toFixed(1)),
                    value_form: parseFloat(value_form.toFixed(1)),
                    performance_index: isNaN(perfScore) ? 0 : parseFloat(perfScore.toFixed(2)),

                    next_opponent_id: nextOppId,
                    next_opponent_name: nextOppTeam?.name,
                    next_opponent_abbr: nextOppTeam?.abbr,
                    next_opponent_difficulty: diffRating,

                    is_available: status === 'a' || status === null,
                    chance_of_playing: chance ?? 100,
                    news
                }
            };
        });

        // 3. Compute Stats / Leaders
        const sortedByPoints = [...enhancedPlayers].sort((a, b) => b.derived.total_points - a.derived.total_points);
        const sortedByValue = [...enhancedPlayers].filter(p => p.derived.minutes_per_game > 45).sort((a, b) => b.derived.value_season - a.derived.value_season);
        const sortedByOwnership = [...enhancedPlayers].sort((a, b) => b.derived.selected_by_percent - a.derived.selected_by_percent);
        const sortedByPerformance = [...enhancedPlayers].sort((a, b) => b.derived.performance_index - a.derived.performance_index);

        return {
            players: enhancedPlayers, // Return the enhanced list (now performing sort is default order? No, lets keep original order or point order, but mapped with index)
            // Actually, let's return sortedByPoints as main list but make sure all have perf index
            // Re-map enhancedPlayers to include performance_index
            teams,
            gameweek: nextGw || null,
            loading: false,
            stats: {
                top_scorer: sortedByPoints[0] || null,
                top_value: sortedByValue[0] || null,
                most_owned: sortedByOwnership[0] || null,
                top_performers: sortedByPerformance.slice(0, 10)
            }
        };

    }, [players, teams, fixtures]);

    return { ...result, loading: playersLoading || teamsLoading || fixturesLoading };
};
