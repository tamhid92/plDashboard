import React from 'react';
import { StandingsTable } from '../components/overview/StandingsTable';
import { RecentGameweek } from '../components/overview/RecentGameweek';
import { UpcomingFixtures } from '../components/overview/UpcomingFixtures';
import { SeasonBumpyChart } from '../components/overview/SeasonBumpyChart';
import { AnalyticsGrid } from '../components/overview/AnalyticsGrid';

export const OverviewPage: React.FC = () => {
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Section 1: Fixtures & Results (Top Grid) */}
            <section id="fixtures" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm">
                    <RecentGameweek />
                </div>
                <div className="glass-card p-6 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm">
                    <UpcomingFixtures />
                </div>
            </section>

            {/* Section 2: Standings (Full Width) */}
            <section id="standings">
                <StandingsTable />
            </section>

            {/* Section 3: Progression & Analytics (Full Width Stack) */}
            <div className="space-y-12">
                {/* Season Progression - Full Width */}
                <section id="progression">
                    <SeasonBumpyChart />
                </section>

                {/* Advanced Analytics - Full Width Grid */}
                <section id="analytics">
                    <AnalyticsGrid />
                </section>
            </div>

            {/* Section 4: Leaderboards (Bottom) */}
            {/* Moved into Analytics Grid */}
        </div>
    );
};
