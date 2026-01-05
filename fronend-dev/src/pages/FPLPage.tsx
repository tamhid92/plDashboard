import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFPLData, type FPLPlayer } from '../hooks/useFPLData';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FPLPlayerTable } from '../components/fpl/FPLPlayerTable';
import { FPLPlayerCard } from '../components/fpl/FPLPlayerCard';
import { FPLValueScatter } from '../components/fpl/FPLDataViz';
import { Navbar } from '../components/layout/Navbar';
import { getTeamLogoUrl } from '../utils/teamLogos';


export const FPLPage = () => {
    const { players, loading, gameweek, stats } = useFPLData();
    const [selectedPlayer, setSelectedPlayer] = useState<FPLPlayer | null>(null);
    const { scrollY } = useScroll();

    // Parallax logic matching TeamDetailsPage
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
    const heroFilter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(10px)"]);
    const contentY = useTransform(scrollY, [0, 400], [0, -50]);

    // Auto-select top player on load
    const hasAutoSelected = useRef(false);
    useEffect(() => {
        if (stats.top_scorer && !selectedPlayer && !hasAutoSelected.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPlayer(stats.top_scorer);
            hasAutoSelected.current = true;
        }
    }, [stats.top_scorer, selectedPlayer]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pl-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden bg-[#f8f9fa]">
            <Navbar />

            {/* Parallax Hero Section (Fixed Layer) */}
            <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
                className="fixed inset-x-0 top-0 h-[500px] z-0 flex items-center justify-center pointer-events-none"
            >
                {/* Background Gradients */}
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/10 via-white/40 to-[#f8f9fa] z-0"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pl-purple/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pl-neon-green/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 pt-20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 md:w-48 md:h-48 p-6 rounded-[2.5rem] bg-white/50 backdrop-blur-md border border-white/60 shadow-xl flex items-center justify-center"
                    >
                        <div className="text-4xl">🦁</div>
                    </motion.div>

                    <div className="flex-1 text-center md:text-left">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="text-sm font-bold text-pl-purple uppercase tracking-widest mb-2">Fantasy Premier League</div>
                            <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none">Analytics</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-600 font-bold">
                                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
                                    Gameweek {gameweek || '?'}
                                </div>
                                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
                                    {players.length} Players Live
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content (Scrollable Layer) */}
            <motion.div style={{ y: contentY }} className="relative z-10 mt-[450px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Dark Card - Top Scorer */}
                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pl-neon-cyan/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-pl-neon-cyan uppercase tracking-wider mb-2">Top Scorer</div>
                                <Link to={`/player/${stats.top_scorer?.player_id}`} className="text-4xl font-black mb-1 block hover:underline cursor-pointer relative z-20">{stats.top_scorer?.player_name}</Link>
                                <div className="text-white/60 text-sm font-bold mb-6">{stats.top_scorer?.team_name}</div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-6xl font-black text-white leading-none">{stats.top_scorer?.derived.total_points}</div>
                                        <div className="text-sm text-gray-400 font-bold mt-2">Total Points</div>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                                        <img src={getTeamLogoUrl(stats.top_scorer?.team_name || '')} className="w-10 h-10 object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Light Card - Best Value */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pl-purple/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-pl-purple uppercase tracking-wider mb-2">Best Value</div>
                                <Link to={`/player/${stats.top_value?.player_id}`} className="text-3xl font-black text-slate-900 mb-1 block hover:underline cursor-pointer relative z-20">{stats.top_value?.player_name}</Link>
                                <div className="text-slate-400 text-sm font-bold mb-6">{stats.top_value?.team_name}</div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-5xl font-black text-slate-900 leading-none">{stats.top_value?.derived.value_season.toFixed(1)}</div>
                                        <div className="text-sm text-slate-400 font-bold mt-2">Points per £1M</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Light Card - Most Owned */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Most Owned</div>
                                <Link to={`/player/${stats.most_owned?.player_id}`} className="text-3xl font-black text-slate-900 mb-1 block hover:underline cursor-pointer relative z-20">{stats.most_owned?.player_name}</Link>
                                <div className="text-slate-400 text-sm font-bold mb-6">{stats.most_owned?.team_name}</div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-5xl font-black text-slate-900 leading-none">{stats.most_owned?.derived.selected_by_percent}%</div>
                                        <div className="text-sm text-slate-400 font-bold mt-2">Ownership</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Elite Performers Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Elite Performers <span className="text-slate-400 text-lg font-medium ml-2">(Top 10)</span></h2>
                            <div className="text-sm font-bold text-pl-purple bg-pl-purple/10 px-3 py-1 rounded-full">
                                Form + PPG Index
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {stats.top_performers.map((p, i) => (
                                <motion.div
                                    key={p.player_id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => setSelectedPlayer(p)}
                                >
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 p-2 mb-3 group-hover:scale-110 transition-transform">
                                            <img src={getTeamLogoUrl(p.team_name)} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-md">#{i + 1}</span>
                                            <span className="text-xs font-bold text-pl-purple uppercase">{p.position}</span>
                                        </div>
                                        <Link
                                            to={`/player/${p.player_id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="font-bold text-slate-900 leading-tight mb-3 line-clamp-1 hover:text-pl-purple hover:underline relative z-20"
                                        >
                                            {p.player_name}
                                        </Link>

                                        <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-slate-50">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">Form</span>
                                                <span className="text-lg font-black text-slate-800">{p.derived.form}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase block">PPG</span>
                                                <span className="text-lg font-black text-slate-800">{p.derived.points_per_game}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Visualizations Section */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Value Analysis</h2>
                        <FPLValueScatter players={players} />
                    </div>

                    {/* Explorer Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[800px]">
                        {/* Left: Table */}
                        <div className="lg:col-span-8 h-full">
                            <FPLPlayerTable
                                players={players}
                                selectedPlayerId={selectedPlayer?.player_id}
                                onSelectPlayer={setSelectedPlayer}
                            />
                        </div>

                        {/* Right: Detail Card */}
                        <div className="lg:col-span-4 sticky top-6 h-full">
                            {selectedPlayer ? (
                                <motion.div
                                    key={selectedPlayer.player_id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="h-full"
                                >
                                    <FPLPlayerCard player={selectedPlayer} />
                                </motion.div>
                            ) : (
                                <div className="bg-white rounded-3xl p-12 text-center border-dashed border-2 border-slate-200 h-full flex flex-col items-center justify-center">
                                    <div className="text-4xl mb-4">👈</div>
                                    <h3 className="font-bold text-slate-400">Select a player to analyze</h3>
                                    <p className="text-sm text-slate-400 mt-2">Click any row in the table</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
