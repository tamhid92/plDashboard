import { LeagueEfficiencyScatter } from './analytics/LeagueEfficiencyScatter';
import { DominanceMatrix } from './analytics/DominanceMatrix';
import { LeagueFormHeatmap } from './analytics/LeagueFormHeatmap';
import { DefensiveStability } from './analytics/DefensiveStability';
import { TopPlayersScatter } from './analytics/TopPlayersScatter';

import { Leaderboards } from './Leaderboards';

export const AnalyticsGrid: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Row 1: Team Playstyle & Efficiency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeagueEfficiencyScatter />
                <DominanceMatrix />
            </div>

            {/* Row 2: Defense & Players */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DefensiveStability />
                <TopPlayersScatter />
            </div>

            {/* Row 3: Momentum & Leaderboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeagueFormHeatmap />
                <Leaderboards />
            </div>
        </div>
    );
};

