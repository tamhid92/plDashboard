import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, Users } from 'lucide-react';
import { usePlayers, useTeams } from '../api/queries';
import { Navbar } from '../components/layout/Navbar';
import { getTeamLogoUrl } from '../utils/teamLogos';
import clsx from 'clsx';

export const PlayersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: players, isLoading: playersLoading } = usePlayers();
    const { data: teams } = useTeams();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<number | 'all'>('all');
    const [selectedPosition, setSelectedPosition] = useState<'all' | 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'>('all');
    const [sortBy, setSortBy] = useState<'points' | 'goals' | 'assists'>('points');

    // Filter and Sort Logic
    const filteredPlayers = useMemo(() => {
        if (!players) return [];

        let result = [...players];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.player_name.toLowerCase().includes(q));
        }

        // Team Filter
        if (selectedTeam !== 'all') {
            result = result.filter(p => p.team_id === selectedTeam);
        }

        // Position Filter
        if (selectedPosition !== 'all') {
            result = result.filter(p => p.position === selectedPosition);
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'goals') return (b.goals || 0) - (a.goals || 0);
            if (sortBy === 'assists') return (b.assists || 0) - (a.assists || 0);
            // Default to points (using fpl_stats total_points if available, else standard fallback)
            const ptsA = a.fpl_stats?.total_points || 0;
            const ptsB = b.fpl_stats?.total_points || 0;
            return ptsB - ptsA;
        });

        return result;
    }, [players, searchQuery, selectedTeam, selectedPosition, sortBy]);

    // Helpers
    const getTeamName = (teamId: number) => {
        return teams?.find(t => t.id === teamId)?.name || 'Unknown Team';
    };

    const getTeamAbbr = (teamId: number) => {
        return teams?.find(t => t.id === teamId)?.abbr || '';
    };

    const positions = ['all', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden bg-[#f8f9fa]">
            <Navbar />

            <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Player Stats</h1>
                            <p className="text-slate-500 font-medium">Explore detailed statistics for every Premier League player.</p>
                        </div>
                    </motion.div>

                    {/* Controls Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between"
                    >
                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search players..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pl-purple/20 focus:bg-white transition-all outline-none font-medium placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                            {/* Position Tabs (Pill style) */}
                            <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                                {positions.map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setSelectedPosition(pos as 'all' | 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward')}
                                        className={clsx(
                                            "px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                                            selectedPosition === pos
                                                ? "bg-white text-pl-purple shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {pos === 'all' ? 'All Positions' : pos}
                                    </button>
                                ))}
                            </div>

                            {/* Team Selector */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-gray-50 pl-4 pr-10 py-2.5 rounded-xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-pl-purple/20 cursor-pointer border-r-8 border-transparent"
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                >
                                    <option value="all">All Teams</option>
                                    {teams?.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>

                            {/* Sort Selector */}
                            <div className="relative group">
                                <select
                                    className="appearance-none bg-gray-50 pl-4 pr-10 py-2.5 rounded-xl font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-pl-purple/20 cursor-pointer border-r-8 border-transparent"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'points' | 'goals' | 'assists')}
                                >
                                    <option value="points">Total Points</option>
                                    <option value="goals">Goals</option>
                                    <option value="assists">Assists</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Grid */}
                {playersLoading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pl-purple"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredPlayers.slice(0, 50).map((player, index) => (
                                <motion.div
                                    key={player.player_id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => navigate(`/player/${player.player_id}`)}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden"
                                >
                                    {/* Team Logo Watermark */}
                                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <img src={getTeamLogoUrl(getTeamName(player.team_id))} alt="" className="w-32 h-32" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 p-1.5 border border-gray-100">
                                                    <img src={getTeamLogoUrl(getTeamName(player.team_id))} alt={getTeamAbbr(player.team_id)} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{player.position}</div>
                                                    <div className="text-xs font-bold text-pl-purple">{getTeamName(player.team_id)}</div>
                                                </div>
                                            </div>
                                            {/* Rank Badge if sorted by points and in top 3 */}
                                            {sortBy === 'points' && index < 3 && (
                                                <div className={clsx(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm",
                                                    index === 0 ? "bg-yellow-100 text-yellow-600" :
                                                        index === 1 ? "bg-gray-100 text-gray-600" :
                                                            "bg-orange-100 text-orange-600"
                                                )}>
                                                    #{index + 1}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-pl-purple transition-colors truncate">
                                            {player.player_name}
                                        </h3>

                                        <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-4">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400 font-bold mb-1">G</div>
                                                <div className="text-lg font-black text-slate-800">{player.goals}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-50">
                                                <div className="text-xs text-gray-400 font-bold mb-1">A</div>
                                                <div className="text-lg font-black text-slate-800">{player.assists}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-50">
                                                <div className="text-xs text-gray-400 font-bold mb-1">PTS</div>
                                                <div className="text-lg font-black text-pl-neon-pink">{player.fpl_stats?.total_points || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!playersLoading && filteredPlayers.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No players found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
