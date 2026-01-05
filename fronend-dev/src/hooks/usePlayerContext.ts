
import { useMemo } from 'react';
import type { Player } from '../api/types';

export interface PlayerContext {
    percentiles: Record<string, number>;
    medians: Record<string, number>;
    per90: Record<string, number>;
    cohortSize: number;
    archetype: string;
    similarPlayers: Player[];
    rankings: Record<string, { rank: number; total: number }>;
}

const MIN_MINUTES_THRESHOLD = 270; // 3 full games

export const usePlayerContext = (player: Player | null | undefined, allPlayers: Player[] | undefined): PlayerContext | null => {
    return useMemo(() => {
        if (!player || !allPlayers) return null;

        // 1. Filter Cohort (Same Position, Min Minutes)
        const cohort = allPlayers.filter(
            p => p.position === player.position && p.minutes_played >= MIN_MINUTES_THRESHOLD
        );

        if (cohort.length === 0) return null;

        // 2. Define Key Metrics for this Position
        // We calculate these for everyone in the cohort
        const metrics = [
            'goals', 'assists', 'expectedGoals', 'totalShots', 'shotsOnTargetIncGoals',
            'totalPasses', 'successfulShortPasses', 'successfulLongPasses', 'keyPassesAttemptAssists',
            'tacklesWon', 'interceptions', 'recoveries', 'duelsWon', 'aerialDuelsWon', 'successfulDribbles',
            'savesMade', 'goalsConceded'
        ];

        // Helper: Calculate Per 90
        const calcPer90 = (p: Player, key: string) => {
            // Check 'stats' first, then 'fpl_stats', then root
            let val = 0;
            if (key in p.stats) val = Number((p.stats as Record<string, unknown>)[key]) || 0;
            else if (p.fpl_stats && key in p.fpl_stats) val = Number((p.fpl_stats as Record<string, unknown>)[key]) || 0;
            else if (key in p) val = Number((p as unknown as Record<string, unknown>)[key]) || 0;
            else {
                // Mapping for tricky legacy names if needed
                if (key === 'expectedGoals') val = (p.stats as any).expectedGoals || Number(p.fpl_stats?.expected_goals) || 0; // eslint-disable-line @typescript-eslint/no-explicit-any
            }

            return (val / p.minutes_played) * 90;
        };

        // 3. Compute Per 90s for current player
        const playerPer90: Record<string, number> = {};
        metrics.forEach(m => {
            playerPer90[m] = calcPer90(player, m);
        });

        // 4. Compute Percentiles & Rankings
        const percentiles: Record<string, number> = {};
        const medians: Record<string, number> = {};
        const rankings: Record<string, { rank: number; total: number }> = {};

        metrics.forEach(m => {
            // Get all values for this metric in cohort
            const values = cohort.map(p => calcPer90(p, m)).sort((a, b) => a - b);

            // Median
            const mid = Math.floor(values.length / 2);
            medians[m] = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

            // Player Rank
            const pVal = playerPer90[m];
            // Rank: How many people have a LOWER value? 
            // Better to use strict rank (index in sorted array)
            // But usually we want "Rank 1" = Highest value.
            // So let's sort Descending for Rank
            const valuesDesc = [...values].reverse();
            const rankIndex = valuesDesc.findIndex(v => v <= pVal); // Simple approx
            rankings[m] = {
                rank: rankIndex === -1 ? values.length : rankIndex + 1,
                total: values.length
            };

            // Percentile (0-100)
            // (Count of values below score / Total count) * 100
            const countBelow = values.filter(v => v < pVal).length;
            percentiles[m] = (countBelow / values.length) * 100;
        });

        // 5. Determine Archetype (Simplified Rule-Based)
        let archetype = 'Generalist';
        if (player.position === 'Forward') {
            if (percentiles['totalShots'] > 75 && percentiles['goals'] > 60) archetype = 'Elite Finisher';
            else if (percentiles['keyPassesAttemptAssists'] > 70) archetype = 'False Nine';
            else if (percentiles['aerialDuelsWon'] > 80) archetype = 'Target Man';
        } else if (player.position === 'Midfielder') {
            if (percentiles['tacklesWon'] > 70 && percentiles['interceptions'] > 70) archetype = 'Ball Winner';
            else if (percentiles['successfulLongPasses'] > 70 && percentiles['keyPassesAttemptAssists'] > 60) archetype = 'Deep Playmaker';
            else if (percentiles['totalPasses'] > 80) archetype = 'Tempo Setter';
            else if (percentiles['goals'] > 70 || percentiles['totalShots'] > 70) archetype = 'Box-to-Box Threat';
        } else if (player.position === 'Defender') {
            if (percentiles['successfulShortPasses'] > 75) archetype = 'Ball-Playing Center Back';
            else if (percentiles['interceptions'] > 80) archetype = 'Anticipatory Defender';
            else if (percentiles['aerialDuelsWon'] > 80) archetype = 'Aerial Dominator';
            else if (percentiles['successfulDribbles'] > 70) archetype = 'Progressive Carrier';
        } else if (player.position === 'Goalkeeper') {
            if (percentiles['successfulLongPasses'] > 70) archetype = 'Distributor';
            else if (percentiles['savesMade'] > 70) archetype = 'Shot Stopper';
        }

        // 6. Identify Similar Players (Euclidean Distance on Key Metrics)
        // We'll normalize each metric (0-1) first to avoid high-volume stats dominating
        const normalize = (val: number, metric: string) => {
            const values = cohort.map(p => calcPer90(p, metric));
            const min = Math.min(...values);
            const max = Math.max(...values);
            return max === min ? 0 : (val - min) / (max - min);
        };

        const keyMetricsForSim = metrics.slice(0, 8); // Use subset for speed/relevance
        const playerNormalized = keyMetricsForSim.map(m => normalize(playerPer90[m], m));

        const similarities = cohort
            .filter(p => p.player_id !== player.player_id)
            .map(p => {
                const pNorm = keyMetricsForSim.map(m => normalize(calcPer90(p, m), m));
                // Euclidean Distance
                let sumSq = 0;
                for (let i = 0; i < keyMetricsForSim.length; i++) {
                    sumSq += Math.pow(playerNormalized[i] - pNorm[i], 2);
                }
                return { player: p, distance: Math.sqrt(sumSq) };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3)
            .map(s => s.player);


        return {
            percentiles,
            medians,
            per90: playerPer90,
            cohortSize: cohort.length,
            archetype,
            similarPlayers: similarities,
            rankings
        };

    }, [player, allPlayers]);
};
