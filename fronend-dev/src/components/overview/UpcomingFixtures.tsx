import React, { useState } from 'react';
import { useUpcomingFixtures, useUpcomingGameweek } from '../../api/queries';
import { MatchCard } from './MatchCard';
import { MatchListModal } from '../common/MatchListModal';

export const UpcomingFixtures: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: gw } = useUpcomingGameweek();
    const { data: fixtures, isLoading } = useUpcomingFixtures();

    if (isLoading) return <div className="h-48 animate-pulse bg-slate-100 rounded-lg"></div>;

    const nextMatches = fixtures
        ?.filter(m => m.gameweek === gw)
        .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());

    if (!nextMatches || nextMatches.length === 0) return null;

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-900">Upcoming Gameweek {gw}</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs text-pl-text-green font-medium hover:underline focus:outline-none"
                    >
                        View all
                    </button>
                </div>
                <div className="flex flex-col space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {nextMatches.map(match => (
                        <MatchCard
                            key={match.match_id}
                            match={match}
                            variant="upcoming"
                            onClick={() => window.location.href = `/match/${match.match_id}`}
                        />
                    ))}
                </div>
            </div>

            <MatchListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="All Upcoming Fixtures"
                matches={fixtures || []}
                variant="upcoming"
            />
        </>
    );
};
