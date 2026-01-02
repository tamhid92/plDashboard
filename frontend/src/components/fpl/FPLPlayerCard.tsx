
import React from 'react';
import { Link } from 'react-router-dom';
import type { FPLPlayer } from '../../hooks/useFPLData';
import { getTeamLogoUrl } from '../../utils/teamLogos';

interface Props {
    player: FPLPlayer;
    onClose?: () => void;
}

export const FPLPlayerCard: React.FC<Props> = ({ player }) => {
    // Prediction Breakdown removed


    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full sticky top-4">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-slate-100 flex items-center justify-center shadow-sm">
                        <img src={getTeamLogoUrl(player.team_name)} alt={player.team_abbr} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <Link to={`/player/${player.player_id}`} className="text-2xl font-black text-slate-900 leading-none hover:text-pl-purple hover:underline">
                            {player.player_name}
                        </Link>
                        <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wide">
                            {player.position}  • {player.team_name}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-black text-pl-purple">{player.derived.now_cost.toFixed(1)}<span className="text-lg text-slate-400">m</span></div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Current Price</div>
                </div>
            </div>

            {/* Availability Warning */}
            {!player.derived.is_available && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                    <span>⚠️</span>
                    {player.fpl_stats?.news || "Player unavailable"}
                </div>
            )}

            {/* Main Stats Grid */}
            {/* Descriptive Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-slate-500 text-xs uppercase font-bold">Total Points</span>
                        <span className="text-2xl font-black text-slate-900">{player.derived.total_points}</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-slate-500 text-xs uppercase font-bold">Points / 90</span>
                        <span className="text-2xl font-black text-slate-900">{player.derived.points_per_90}</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-slate-500 text-xs uppercase font-bold">Form</span>
                        <span className="text-2xl font-black text-slate-900">{player.derived.form}</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-slate-500 text-xs uppercase font-bold">Value</span>
                        <span className="text-2xl font-black text-slate-900">{player.derived.value_season}</span>
                    </div>
                </div>
            </div>

            {/* Recent Performance Box (Descriptive) */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-6 text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs uppercase font-bold opacity-60 tracking-wider">Last Gameweek Points</div>
                    </div>
                    <div className="text-5xl font-black tracking-tight mb-4">{player.derived.last_gameweek_points}</div>

                    <div className="grid grid-cols-3 gap-2 border-t border-white/20 pt-4">
                        <div>
                            <div className="text-[10px] uppercase opacity-70">ICT Index</div>
                            <div className="font-bold text-lg">{player.derived.ict_index}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase opacity-70">Ownership</div>
                            <div className="font-bold text-lg">{player.derived.selected_by_percent}%</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase opacity-70">Price</div>
                            <div className="font-bold text-lg">£{player.derived.now_cost}m</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Opponent */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">Next Opponent</h3>
                {player.derived.next_opponent_name ? (
                    <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {player.derived.next_opponent_abbr}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-800">{player.derived.next_opponent_name}</div>
                            <div className="text-xs text-slate-400">Difficulty Rating</div>
                        </div>
                        <div className="ml-auto bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                            {player.derived.next_opponent_difficulty}/5
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 shadow-sm opacity-50">
                        <div className="text-sm font-bold text-slate-400">No Upcoming Match</div>
                    </div>
                )}
            </div>
        </div>
    );
};

