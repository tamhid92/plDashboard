import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompletedFixtures, useUpcomingGameweek } from '../../api/queries';
import { MatchCard } from './MatchCard';
import { MatchListModal } from '../common/MatchListModal';


export const RecentGameweek: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: upcomingGw } = useUpcomingGameweek();
    const { data: fixtures, isLoading } = useCompletedFixtures();

    if (isLoading) return <div className="h-48 animate-pulse bg-slate-100 rounded-lg"></div>;

    // If no upcoming gameweek (end of season), use 38. If gw 1, no recent.
    const currentGw = upcomingGw ? upcomingGw - 1 : 38;

    const recentMatches = fixtures
        ?.filter(m => m.gameweek === currentGw)
        .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime());

    if (!recentMatches || recentMatches.length === 0) return null; // Or message "No matches"

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-slate-900">Gameweek {currentGw} Results</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs text-pl-text-green font-medium hover:underline focus:outline-none"
                    >
                        View all
                    </button>
                </div>
                <div className="flex flex-col space-y-2 max-h-[500px] overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {recentMatches.map(match => (
                        <MatchCard
                            key={match.match_id}
                            match={match}
                            variant="completed"
                            onClick={() => navigate(`/match/${match.match_id}`)}
                        />
                    ))}
                </div>
            </div>

            <MatchListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="All Completed Fixtures"
                matches={fixtures || []}
                variant="completed"
            />
        </>
    );
};
