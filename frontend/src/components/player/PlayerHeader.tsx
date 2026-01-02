
import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../api/types';
import { Shield, Info, CheckCircle } from 'lucide-react';

interface PlayerHeaderProps {
    player: Player;
    teamName: string;
    teamColor: string; // Hex color
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, teamName, teamColor }) => {
    const statusColor =
        player.fpl_stats?.status === 'a' ? 'bg-green-500' :
            player.fpl_stats?.status === 'd' ? 'bg-yellow-500' :
                player.fpl_stats?.status === 'i' ? 'bg-red-500' : 'bg-gray-500';

    const statusText =
        player.fpl_stats?.status === 'a' ? 'Available' :
            player.fpl_stats?.status === 'd' ? 'Doubtful' :
                player.fpl_stats?.status === 'i' ? 'Injured' : 'Unknown';

    // Calculate Age
    const age = player.dob ? new Date().getFullYear() - new Date(player.dob).getFullYear() : 'N/A';

    return (
        <div className="relative w-full overflow-hidden rounded-3xl shadow-lg border border-white/10 mt-6">
            {/* Dynamic Background Gradient */}
            <div
                className="absolute inset-0 opacity-90"
                style={{
                    background: `linear-gradient(135deg, ${teamColor} 0%, #0f172a 80%)`
                }}
            />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>

            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">

                {/* Left: Identity */}
                <div className="flex flex-col gap-2 z-10 w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                            {player.position}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-bold text-gray-200">
                            <div className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                            {statusText}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                        {player.first_name} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                            {player.last_name}
                        </span>
                    </h1>

                    <div className="flex items-center gap-6 mt-4 text-gray-300 font-medium text-sm md:text-base">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Number</span>
                            <span className="text-xl font-bold text-white font-mono">#{player.shirt_num || '-'}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Team</span>
                            <span className="text-white font-bold">{teamName}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Age</span>
                            <span className="text-white font-bold">{age}</span>
                        </div>
                        <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Height</span>
                            <span className="text-white font-bold">{player.height}cm</span>
                        </div>
                        <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Foot</span>
                            <span className="text-white font-bold">{player.preferred_foot}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Availability & FPL Pulse */}
                <div className="flex flex-col items-end gap-3 z-10 w-full md:w-auto">
                    {player.fpl_stats?.news && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-100 px-4 py-2 rounded-lg text-xs font-medium max-w-sm text-right flex items-center gap-2"
                        >
                            <Info size={14} className="text-red-400" />
                            {player.fpl_stats.news}
                        </motion.div>
                    )}

                    <div className="flex gap-4">
                        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                            <span className="block text-gray-400 text-[10px] uppercase tracking-widest mb-1">Min. Played</span>
                            <span className="text-2xl font-black text-white font-mono">
                                {player.stats.timePlayed?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[100px]">
                            <span className="block text-gray-400 text-[10px] uppercase tracking-widest mb-1">Starts</span>
                            <span className="text-2xl font-black text-white font-mono">
                                {player.stats.starts || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
