import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { MatchCard } from '../overview/MatchCard';
import { getTeamLogoUrl } from '../../utils/teamLogos';
import type { Fixture, CompletedFixture } from '../../api/types';

interface MatchListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    matches: (Fixture | CompletedFixture)[];
    variant: 'upcoming' | 'completed';
}

export const MatchListModal: React.FC<MatchListModalProps> = ({ isOpen, onClose, title, matches, variant }) => {
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    // Handle "Back" button and "Escape" key
    React.useEffect(() => {
        if (isOpen) {
            // Push a new state so the "Back" button closes the modal instead of navigating away
            window.history.pushState({ modalOpen: true }, '', window.location.href);

            const handlePopState = () => {
                // When "Back" is pressed, close the modal
                onClose();
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    // Manually trigger back to pop the state we pushed, which will trigger handlePopState -> onClose
                    window.history.back();
                }
            };

            window.addEventListener('popstate', handlePopState);
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                window.removeEventListener('keydown', handleKeyDown);
                // If the modal is closing but we're still in the "modalOpen" state (e.g. clicked X),
                // we need to go back to clean up the history stack.
                // However, we need to be careful not to double-back if it was closed via Back button.
                // Checking history.state is unreliable across browsers, but typically if we closed via X,
                // we should go back. If we closed via Back, we already went back.
            };
        }
    }, [isOpen]);

    // Derived close handler for the "X" button to sync with history
    const handleManualClose = () => {
        window.history.back();
    };

    // Get unique teams from the matches for the filter
    const teams = useMemo(() => {
        const teamSet = new Set<string>();
        matches.forEach(m => {
            teamSet.add(m.home_team_name);
            teamSet.add(m.away_team_name);
        });
        return Array.from(teamSet).sort();
    }, [matches]);

    // Filter matches
    const filteredMatches = useMemo(() => {
        if (!selectedTeam) return matches;
        return matches.filter(m => m.home_team_name === selectedTeam || m.away_team_name === selectedTeam);
    }, [matches, selectedTeam]);

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleManualClose}
                    className="fixed inset-0 z-[40] bg-slate-900/40 backdrop-blur-[2px] flex flex-col justify-end items-center h-screen w-screen"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-[95%] md:w-[80%] max-w-7xl h-[85vh] flex flex-col bg-slate-50 relative rounded-t-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                                <p className="text-gray-500 text-sm font-medium mt-1">
                                    {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} shown
                                </p>
                            </div>
                            <button
                                onClick={handleManualClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-gray-500 hover:text-slate-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex flex-wrap gap-2 shrink-0 max-h-[30vh] overflow-y-auto">
                            <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider mr-2 mb-2">
                                <Filter size={14} className="mr-1.5" />
                                Filter
                            </div>
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border mb-2 ${selectedTeam === null
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                All Teams
                            </button>
                            {teams.map(team => (
                                <button
                                    key={team}
                                    onClick={() => setSelectedTeam(team === selectedTeam ? null : team)}
                                    className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border mb-2 ${selectedTeam === team
                                        ? 'bg-white text-slate-900 border-pl-purple ring-1 ring-pl-purple shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <img src={getTeamLogoUrl(team)} alt={team} className="w-4 h-4 object-contain" />
                                    <span>{team}</span>
                                </button>
                            ))}
                        </div>

                        {/* Match Grid */}
                        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 min-h-0">
                            {filteredMatches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredMatches.map(match => (
                                        <MatchCard
                                            key={match.match_id}
                                            match={match}
                                            variant={variant}
                                            onClick={() => {
                                                window.location.href = `/match/${match.match_id}`;
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Filter size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">No matches found for this filter</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};
