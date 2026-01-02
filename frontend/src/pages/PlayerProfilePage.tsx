
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePlayer, useTeam, usePlayers } from '../api/queries';
import { ArrowLeft } from 'lucide-react';
import { PlayerHeader } from '../components/player/PlayerHeader';
import { IdentityRadar } from '../components/player/IdentityRadar';
import { GKStatsModule } from '../components/player/modules/GKStatsModule';
import { OutfieldStatsModule } from '../components/player/modules/OutfieldStatsModule';
import { FPLAnalysis } from '../components/player/modules/FPLAnalysis';
import { RiskProfile } from '../components/player/modules/RiskProfile';
import { PeerContextModule } from '../components/player/modules/PeerContextModule';
import { Navbar } from '../components/layout/Navbar';
import { usePlayerContext } from '../hooks/usePlayerContext';

export const PlayerProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: pData, isLoading: playerLoading } = usePlayer(Number(id));

    // Parallax Hooks
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 1.05]);
    const heroFilter = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(8px)"]);
    const contentY = useTransform(scrollY, [0, 300], [0, -50]);

    // Hook now handles array logic and normalization
    const player = pData as any;

    const { data: team } = useTeam(player?.team_id || 0);
    const { data: allPlayers } = usePlayers();
    const context = usePlayerContext(player, allPlayers);

    // Team Branding
    const getTeamColor = (teamName: string = '') => {
        const colors: Record<string, string> = {
            'Arsenal': '#EF0107', 'Aston Villa': '#95BEB5', 'Bournemouth': '#DA291C',
            'Brentford': '#E30613', 'Brighton': '#0057B8', 'Chelsea': '#034694',
            'Crystal Palace': '#1B458F', 'Everton': '#003399', 'Fulham': '#000000',
            'Ipswich': '#0054A6', 'Leicester': '#0053A0', 'Liverpool': '#C8102E',
            'Man City': '#6CABDD', 'Man Utd': '#DA291C', 'Newcastle': '#241F20',
            'Nott\'m Forest': '#DD0000', 'Southampton': '#D71920', 'Spurs': '#132257',
            'West Ham': '#7A263A', 'Wolves': '#FDB913'
        };
        const found = Object.keys(colors).find(k => teamName.includes(k));
        return found ? colors[found] : '#64748b';
    };

    const brandColor = getTeamColor(team?.name);

    if (playerLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-32 w-32 bg-slate-200 rounded-full mb-4"></div>
                    <div className="h-8 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!player) return <div className="min-h-screen flex items-center justify-center text-slate-500">Player not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            <Navbar />

            {/* Parallax Hero Section (Fixed Layer) */}
            <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
                className="fixed inset-x-0 top-0 h-[500px] z-0 pointer-events-none"
            >
                {/* Standard Gradient Background (Consistent with MatchDetails) */}
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/10 via-white/50 to-[#f8f9fa] z-0"></div>

                <div className="relative z-10 p-4 pt-32 max-w-7xl mx-auto flex flex-col justify-end h-full pb-12">
                    <PlayerHeader player={player} teamName={team?.name || ''} teamColor={brandColor} />
                </div>
            </motion.div>

            {/* Main Content (Scrollable Layer) */}
            <motion.div style={{ y: contentY }} className="relative z-10 mt-[480px]">
                <div className="max-w-7xl mx-auto px-6 pb-20 space-y-6">
                    {/* Back Button */}
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-white/80 backdrop-blur px-5 py-2.5 rounded-full border border-white/50 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft size={18} />
                            <span className="font-bold text-sm">Back</span>
                        </button>
                    </div>

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left Column: Identity, Context & Risk (4 cols) */}
                        <div className="lg:col-span-4 space-y-6 flex flex-col">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex-1 min-h-[300px]"
                            >
                                <IdentityRadar player={player} color={brandColor} />
                            </motion.div>

                            {/* [NEW] Positional Context Module */}
                            {context && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    <PeerContextModule player={player} context={context} color={brandColor} />
                                </motion.div>
                            )}


                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="h-auto"
                            >
                                <RiskProfile player={player} />
                            </motion.div>
                        </div>

                        {/* Right Column: Performance & FPL (8 cols) */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Position-Specific Performance Module */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {player.position === 'Goalkeeper' ? (
                                    <GKStatsModule player={player} color={brandColor} />
                                ) : (
                                    <OutfieldStatsModule player={player} color={brandColor} />
                                )}
                            </motion.div>

                            {/* FPL Analysis Module */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <FPLAnalysis player={player} />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
