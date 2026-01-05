import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, ArrowRightLeft, MapPin, Users } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import clsx from 'clsx';
import { useCompletedFixtures, useUpcomingFixtures, usePlayers } from '../api/queries';
import { PlayerName } from '../components/players/PlayerName';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { format } from 'date-fns';
import { Navbar } from '../components/layout/Navbar';
import type { CompletedFixture, Fixture, Player } from '../api/types';

// Moved outside component to avoid re-creation on render
const StatRow = ({ label, homeValue, awayValue, total, isPercentage = false }: { label: string, homeValue: number, awayValue: number, total?: number, isPercentage?: boolean }) => {
    const t = total || (homeValue + awayValue) || 1;
    const homePct = isPercentage ? homeValue : (homeValue / t) * 100;
    const awayPct = isPercentage ? awayValue : (awayValue / t) * 100;

    return (
        <div className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-bold text-slate-800 w-12 text-left">{isPercentage ? `${homeValue}%` : homeValue}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                <span className="font-bold text-slate-800 w-12 text-right">{isPercentage ? `${awayValue}%` : awayValue}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white z-10"></div>
                <div style={{ width: `${homePct}%` }} className="bg-pl-purple transition-all duration-500 ml-auto rounded-l-full"></div>
                <div style={{ width: `${awayPct}%` }} className="bg-pl-neon-pink transition-all duration-500 mr-auto rounded-r-full"></div>
            </div>
        </div>
    );
};

const SquadList = ({ players, teamName }: { players: Player[], teamName: string }) => {
    const grouped = {
        'Goalkeepers': players.filter(p => p.position === 'Goalkeeper'),
        'Defenders': players.filter(p => p.position === 'Defender'),
        'Midfielders': players.filter(p => p.position === 'Midfielder'),
        'Forwards': players.filter(p => p.position === 'Forward'),
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center mb-6 border-b border-gray-100 pb-2">
                <img src={getTeamLogoUrl(teamName)} alt={teamName} className="w-6 h-6 object-contain mr-2" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{teamName} Squad</h3>
            </div>

            <div className="space-y-6">
                {Object.entries(grouped).map(([pos, list]) => (
                    list.length > 0 && (
                        <div key={pos}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{pos}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {list.map(p => (
                                    <div key={p.player_id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            {p.player_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">{p.player_name}</div>
                                            <div className="text-[10px] text-gray-400 flex space-x-2">
                                                <span>{p.goals} Goals</span>
                                                <span>•</span>
                                                <span>{p.assists} Assists</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
                {players.length === 0 && <div className="text-sm text-gray-400 italic">Squad data not available.</div>}
            </div>
        </div>
    );
};

export const MatchDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: completedFixtures, isLoading: loadingCompleted } = useCompletedFixtures();
    const { data: upcomingFixtures, isLoading: loadingUpcoming } = useUpcomingFixtures();
    const { data: players } = usePlayers();

    // Parallax Hooks
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
    const heroFilter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(10px)"]);
    const contentY = useTransform(scrollY, [0, 400], [0, -50]);

    // 1. Find Match (Check both lists)
    const match = useMemo(() => {
        if (!id) return null;
        const comp = completedFixtures?.find(f => f.match_id.toString() === id);
        if (comp) return comp;
        const upc = upcomingFixtures?.find(f => f.match_id.toString() === id);
        return upc || null;
    }, [completedFixtures, upcomingFixtures, id]);

    // 2. Identify Type using Type Guard
    const isCompleted = (m: Fixture | CompletedFixture): m is CompletedFixture => {
        return 'home_team_score' in m;
    };

    // 3. Prepare Player Data (Map & Squads)
    const { playerMap, homeSquad, awaySquad } = useMemo(() => {
        if (!players || !match) return { playerMap: {}, homeSquad: [], awaySquad: [] };

        const map: Record<number, string> = {};
        const home: Player[] = [];
        const away: Player[] = [];

        players.forEach(p => {
            map[p.player_id] = p.player_name;
            if (p.team_id === match.home_team_id) {
                home.push(p);
            } else if (p.team_id === match.away_team_id) {
                away.push(p);
            }
        });

        // Sort squads by position order (Goalkeeper, Defender, Midfielder, Forward)
        const posOrder: Record<string, number> = { 'Goalkeeper': 1, 'Defender': 2, 'Midfielder': 3, 'Forward': 4 };
        const sorter = (a: Player, b: Player) => (posOrder[a.position] || 9) - (posOrder[b.position] || 9);

        return {
            playerMap: map,
            homeSquad: home.sort(sorter),
            awaySquad: away.sort(sorter)
        };
    }, [players, match]);

    const getPlayerName = (id: string | number) => {
        if (!id) return 'Unknown Player';
        const numId = Number(id);
        const name = playerMap[numId];
        return name || `Player ${id}`;
    };

    const getPlayerMapName = (id: string | number) => {
        if (!id) return '';
        const numId = Number(id);
        return playerMap[numId] || `Player ${id}`;
    };

    if (loadingCompleted || loadingUpcoming) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading match details...</div>;
    if (!match) return <div className="min-h-screen flex items-center justify-center text-slate-500">Match not found.</div>;

    const events: { time: number, timeStr: string, type: 'goal' | 'card' | 'sub', player: string, playerId: string | number, team: 'home' | 'away', detail?: string }[] = [];
    interface RadarMetric { subject: string; A: number; B: number; fullMark: number; }
    let radarData: RadarMetric[] = [];

    if (isCompleted(match)) {
        // ... (Existing Event Processing Logic)
        if (match.events) {
            match.events.homeTeam.goals.forEach(e => events.push({
                time: parseInt(e.time), timeStr: e.time, type: 'goal',
                player: getPlayerName(e.playerId), playerId: e.playerId, team: 'home',
                detail: e.goalType === 'P' ? 'Penalty' : (e.assistPlayerId ? `Assist: ${getPlayerName(e.assistPlayerId)}` : undefined)
            }));
            match.events.awayTeam.goals.forEach(e => events.push({
                time: parseInt(e.time), timeStr: e.time, type: 'goal',
                player: getPlayerName(e.playerId), playerId: e.playerId, team: 'away',
                detail: e.goalType === 'P' ? 'Penalty' : (e.assistPlayerId ? `Assist: ${getPlayerName(e.assistPlayerId)}` : undefined)
            }));
            match.events.homeTeam.cards.forEach(e => events.push({ time: parseInt(e.time), timeStr: e.time, type: 'card', player: getPlayerName(e.playerId), playerId: e.playerId, team: 'home', detail: e.type }));
            match.events.awayTeam.cards.forEach(e => events.push({ time: parseInt(e.time), timeStr: e.time, type: 'card', player: getPlayerName(e.playerId), playerId: e.playerId, team: 'away', detail: e.type }));
            match.events.homeTeam.subs.forEach(e => events.push({ time: parseInt(e.time), timeStr: e.time, type: 'sub', player: `${getPlayerName(e.playerOnId)}`, playerId: e.playerOnId, team: 'home', detail: `Out: ${getPlayerName(e.playerOffId)}` }));
            match.events.awayTeam.subs.forEach(e => events.push({ time: parseInt(e.time), timeStr: e.time, type: 'sub', player: `${getPlayerName(e.playerOnId)}`, playerId: e.playerOnId, team: 'away', detail: `Out: ${getPlayerName(e.playerOffId)}` }));
            events.sort((a, b) => a.time - b.time);
        }

        radarData = [
            { subject: 'Possession', A: match.home_stats.possessionPercentage, B: match.away_stats.possessionPercentage, fullMark: 100 },
            { subject: 'Shots', A: match.home_stats.totalScoringAtt, B: match.away_stats.totalScoringAtt, fullMark: Math.max(match.home_stats.totalScoringAtt, match.away_stats.totalScoringAtt) + 5 },
            { subject: 'Passes', A: match.home_stats.totalPass / 10, B: match.away_stats.totalPass / 10, fullMark: Math.max(match.home_stats.totalPass, match.away_stats.totalPass) / 10 },
            { subject: 'Duels', A: match.home_stats.duelWon, B: match.away_stats.duelWon, fullMark: Math.max(match.home_stats.duelWon, match.away_stats.duelWon) + 5 },
            { subject: 'Aerials', A: match.home_stats.aerialWon, B: match.away_stats.aerialWon, fullMark: Math.max(match.home_stats.aerialWon, match.away_stats.aerialWon) + 5 },
            { subject: 'xG', A: match.home_stats.expectedGoals * 20, B: match.away_stats.expectedGoals * 20, fullMark: 100 },
        ];
    }

    return (
        <div className="min-h-screen pb-20 overflow-x-hidden">
            <Navbar />

            {/* Parallax Hero Section (Fixed Layer) */}
            <motion.div
                style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
                className="fixed inset-x-0 top-0 h-[500px] z-0 flex items-center justify-center pointer-events-none"
            >
                <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/10 via-white/50 to-[#f8f9fa] z-0"></div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center pt-32">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-pl-purple mb-8 px-4 py-1.5 rounded-full border border-pl-purple/20 backdrop-blur-sm bg-white/40 flex items-center">
                        <MapPin size={12} className="mr-2" />
                        {match.venue}
                    </div>

                    <div className="flex w-full items-center justify-between">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1 transition-transform duration-700 hover:scale-105">
                            <img src={getTeamLogoUrl(match.home_team_name)} alt={match.home_team_abbr} className="w-24 h-24 md:w-40 md:h-40 object-contain mb-6 drop-shadow-xl" />
                            <h2 className="text-2xl md:text-5xl font-black text-center text-slate-900 tracking-tighter leading-none">{match.home_team_name}</h2>
                        </div>

                        {/* Score or VS */}
                        <div className="flex flex-col items-center px-4 md:px-12">
                            {isCompleted(match) ? (
                                <div className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter mb-4 font-mono drop-shadow-sm">
                                    {match.home_team_score} - {match.away_team_score}
                                </div>
                            ) : (
                                <div className="text-5xl md:text-8xl font-black text-slate-200 tracking-tighter mb-4 font-mono">
                                    VS
                                </div>
                            )}

                            {isCompleted(match) ? (
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-md border border-gray-200 shadow-sm">
                                    <Clock size={14} className="mr-2 text-pl-neon-pink" />
                                    Full Time
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="text-xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
                                        {format(new Date(match.kickoff_time), 'HH:mm')}
                                    </div>
                                    <div className="text-xs font-bold text-pl-purple uppercase tracking-widest bg-pl-purple/5 px-3 py-1 rounded-full border border-pl-purple/10">
                                        Upcoming
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1 transition-transform duration-700 hover:scale-105">
                            <img src={getTeamLogoUrl(match.away_team_name)} alt={match.away_team_abbr} className="w-24 h-24 md:w-40 md:h-40 object-contain mb-6 drop-shadow-xl" />
                            <h2 className="text-2xl md:text-5xl font-black text-center text-slate-900 tracking-tighter leading-none">{match.away_team_name}</h2>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center text-gray-500 font-medium">
                        <Calendar size={18} className="mr-2.5 text-pl-purple" />
                        {format(new Date(match.kickoff_time), 'EEEE, d MMMM yyyy')}
                    </div>
                </div>
            </motion.div>

            {/* Main Content (Scrollable Layer) */}
            <motion.div style={{ y: contentY }} className="relative z-10 mt-[450px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="bg-slate-50/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-white/50 min-h-screen">

                        {/* Page Navigation */}
                        <div className="mb-8">
                            <button onClick={() => navigate('/')} className="flex items-center text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-pl-purple transition-colors">
                                <ArrowLeft size={16} className="mr-2" /> Back to Overview
                            </button>
                        </div>

                        {/* CONTENT SWITCHING BASED ON MATCH TYPE */}
                        {isCompleted(match) ? (
                            <div className="space-y-8">
                                {/* 1. Match Events */}
                                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100">
                                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                                        {/* Home Events */}
                                        <div>
                                            <div className="flex items-center mb-6 border-b border-gray-100 pb-2">
                                                <img src={getTeamLogoUrl(match.home_team_name)} alt={match.home_team_abbr} className="w-6 h-6 object-contain mr-2" />
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{match.home_team_name} Events</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {events.filter(e => e.team === 'home').length > 0 ? (
                                                    events.filter(e => e.team === 'home').map((e, i) => (
                                                        <div key={i} className="flex items-center group">
                                                            <div className="font-mono text-xs font-bold text-gray-400 w-8">{e.timeStr}'</div>
                                                            <div className={clsx(
                                                                "w-8 h-8 rounded-full flex items-center justify-center border mr-3 shadow-sm",
                                                                e.type === 'goal' ? "bg-pl-text-green border-pl-text-green text-white" : "",
                                                                e.type === 'card' ? "bg-white border-yellow-400 text-slate-700" : "",
                                                                e.type === 'sub' ? "bg-white border-slate-200 text-slate-500" : ""
                                                            )}>
                                                                {e.type === 'goal' && (
                                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.1 5.39z" />
                                                                    </svg>
                                                                )}
                                                                {e.type === 'card' && <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>}
                                                                {e.type === 'sub' && <ArrowRightLeft size={14} strokeWidth={2} />}
                                                            </div>
                                                            <div>
                                                                {e.type === 'goal' && <div className="text-[10px] font-black text-pl-text-green uppercase tracking-widest leading-tight mb-0.5">GOAL</div>}
                                                                <div className="text-sm font-bold text-slate-800 leading-none">
                                                                    <PlayerName playerId={e.playerId} name={getPlayerName(e.playerId)} />
                                                                </div>
                                                                {e.detail && <div className="text-[10px] text-gray-400 font-medium uppercase mt-1">{e.detail}</div>}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : <div className="text-sm text-gray-400 italic">No events recorded.</div>}
                                            </div>
                                        </div>

                                        {/* Away Events */}
                                        <div>
                                            <div className="flex items-center justify-end mb-6 border-b border-gray-100 pb-2">
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-right">{match.away_team_name} Events</h3>
                                                <img src={getTeamLogoUrl(match.away_team_name)} alt={match.away_team_abbr} className="w-6 h-6 object-contain ml-2" />
                                            </div>
                                            <div className="space-y-4">
                                                {events.filter(e => e.team === 'away').length > 0 ? (
                                                    events.filter(e => e.team === 'away').map((e, i) => (
                                                        <div key={i} className="flex items-center justify-end group text-right">
                                                            <div>
                                                                {e.type === 'goal' && <div className="text-[10px] font-black text-pl-text-green uppercase tracking-widest leading-tight mb-0.5">GOAL</div>}
                                                                <div className="text-sm font-bold text-slate-800 leading-none">
                                                                    <PlayerName playerId={e.playerId} name={getPlayerName(e.playerId)} />
                                                                </div>
                                                                {e.detail && <div className="text-[10px] text-gray-400 font-medium uppercase mt-1">{e.detail}</div>}
                                                            </div>
                                                            <div className={clsx(
                                                                "w-8 h-8 rounded-full flex items-center justify-center border ml-3 shadow-sm",
                                                                e.type === 'goal' ? "bg-pl-text-green border-pl-text-green text-white" : "",
                                                                e.type === 'card' ? "bg-white border-yellow-400 text-slate-700" : "",
                                                                e.type === 'sub' ? "bg-white border-slate-200 text-slate-500" : ""
                                                            )}>
                                                                {e.type === 'goal' && (
                                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.1 5.39z" />
                                                                    </svg>
                                                                )}
                                                                {e.type === 'card' && <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>}
                                                                {e.type === 'sub' && <ArrowRightLeft size={14} strokeWidth={2} />}
                                                            </div>
                                                            <div className="font-mono text-xs font-bold text-gray-400 w-8 text-right">{e.timeStr}'</div>
                                                        </div>
                                                    ))
                                                ) : <div className="text-sm text-gray-400 italic text-right">No events recorded.</div>}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* 2. Lineups */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Home Lineup */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                                            <div className="flex items-center">
                                                <img src={getTeamLogoUrl(match.home_team_name)} alt={match.home_team_abbr} className="w-8 h-8 object-contain mr-3" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{match.home_team_name}</h3>
                                                    <span className="text-xs text-gray-500 font-mono">Formation: {match.home_team_lineup?.formation}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-pl-text-green/10 rounded-xl p-4 relative min-h-[400px] flex flex-col justify-center border border-pl-text-green/20">
                                            <div className="absolute inset-x-0 top-0 h-px bg-white/40"></div>
                                            <div className="absolute inset-x-0 bottom-0 h-px bg-white/40"></div>
                                            <div className="absolute inset-x-12 top-0 h-16 border-x border-b border-white/40"></div>
                                            <div className="absolute inset-x-12 bottom-0 h-16 border-x border-t border-white/40"></div>
                                            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/40"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/40"></div>

                                            <div className="relative z-10 flex flex-col justify-between h-full py-4 space-y-4">
                                                {match.home_team_lineup?.lineup?.map((row: string[], i: number) => (
                                                    <div key={i} className="flex justify-center items-center gap-8 sm:gap-12">
                                                        {row.map((playerId: string) => (
                                                            <div key={playerId} className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-900 border-2 border-slate-900 font-bold text-xs flex items-center justify-center shadow-lg relative z-20">
                                                                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden">
                                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                                                                            {playerMap[Number(playerId)]?.charAt(0)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded shadow-sm opacity-90 font-medium whitespace-nowrap">
                                                                    <PlayerName playerId={playerId} name={getPlayerMapName(playerId)} className="text-white hover:text-pl-neon-green" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Substitutes</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {match.home_team_lineup?.subs?.map((subId: number) => (
                                                    <span key={subId} className="text-xs bg-slate-50 border border-gray-100 px-2 py-1 rounded text-slate-600">
                                                        <PlayerName playerId={subId} name={getPlayerMapName(subId)} />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Away Lineup */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                                            <div className="flex items-center justify-end w-full">
                                                <div className="text-right mr-3">
                                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{match.away_team_name}</h3>
                                                    <span className="text-xs text-gray-500 font-mono">Formation: {match.away_team_lineup?.formation}</span>
                                                </div>
                                                <img src={getTeamLogoUrl(match.away_team_name)} alt={match.away_team_abbr} className="w-8 h-8 object-contain" />
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-slate-50 rounded-xl p-4 relative min-h-[400px] flex flex-col justify-center border border-gray-200">
                                            <div className="absolute inset-x-0 top-0 h-px bg-gray-300/50"></div>
                                            <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300/50"></div>
                                            <div className="absolute inset-x-12 top-0 h-16 border-x border-b border-gray-300/50"></div>
                                            <div className="absolute inset-x-12 bottom-0 h-16 border-x border-t border-gray-300/50"></div>
                                            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300/50"></div>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-gray-300/50"></div>

                                            <div className="relative z-10 flex flex-col justify-between h-full py-4 space-y-4">
                                                {match.away_team_lineup?.lineup?.map((row: string[], i: number) => (
                                                    <div key={i} className="flex justify-center items-center gap-8 sm:gap-12">
                                                        {row.map((playerId: string) => (
                                                            <div key={playerId} className="flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-900 border-2 border-indigo-900 font-bold text-xs flex items-center justify-center shadow-lg relative z-20">
                                                                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden">
                                                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-400">
                                                                            {playerMap[Number(playerId)]?.charAt(0)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded shadow-sm opacity-90 font-medium whitespace-nowrap">
                                                                    <PlayerName playerId={playerId} name={getPlayerMapName(playerId)} className="text-white hover:text-pl-neon-green" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Substitutes</h4>
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {match.away_team_lineup?.subs?.map((subId: number) => (
                                                    <span key={subId} className="text-xs bg-slate-50 border border-gray-100 px-2 py-1 rounded text-slate-600">
                                                        <PlayerName playerId={subId} name={getPlayerMapName(subId)} />
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Stats & Radar */}
                                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-center mb-8">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] bg-slate-100 px-4 py-1 rounded-full">Match Statistics</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <StatRow label="Possession" isPercentage homeValue={match.home_stats.possessionPercentage} awayValue={match.away_stats.possessionPercentage} />
                                            <StatRow label="Exp. Goals (xG)" homeValue={match.home_stats.expectedGoals} awayValue={match.away_stats.expectedGoals} />
                                            <StatRow label="Total Shots" homeValue={match.home_stats.totalScoringAtt} awayValue={match.away_stats.totalScoringAtt} />
                                            <StatRow label="Shots on Target" homeValue={match.home_stats.ontargetScoringAtt} awayValue={match.away_stats.ontargetScoringAtt} />
                                            <StatRow label="Passes" homeValue={match.home_stats.totalPass} awayValue={match.away_stats.totalPass} />
                                            <StatRow label="Corners" homeValue={match.home_stats.wonCorners} awayValue={match.away_stats.wonCorners} />
                                            <StatRow label="Fouls" homeValue={match.home_stats.fkFoulLost} awayValue={match.away_stats.fkFoulLost} />
                                            <StatRow label="Duels Won" homeValue={match.home_stats.duelWon} awayValue={match.away_stats.duelWon} />
                                            <StatRow label="Aerials Won" homeValue={match.home_stats.aerialWon} awayValue={match.away_stats.aerialWon} />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
                                        <div className="flex items-center justify-center mb-4">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] bg-slate-100 px-4 py-1 rounded-full">Performance Radar</h3>
                                        </div>
                                        <div className="h-[400px] w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                    <PolarGrid stroke="#e2e8f0" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                                    <Radar name={match.home_team_name} dataKey="A" stroke="#38003c" fill="#38003c" fillOpacity={0.3} />
                                                    <Radar name={match.away_team_name} dataKey="B" stroke="#00ff85" fill="#00ff85" fillOpacity={0.5} />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </section>

                                {/* 4. Match Report */}
                                {match.match_report && (
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <div className="flex items-center justify-center mb-8">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] bg-slate-100 px-4 py-1 rounded-full">Match Report</h3>
                                        </div>
                                        <article className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900">
                                            {match.match_report.split('\n').map((paragraph, idx) => (
                                                paragraph.trim() && <p key={idx} className="mb-4">{paragraph.trim()}</p>
                                            ))}
                                        </article>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* UPCOMING MATCH VIEW */}

                                {/* Squad Lists */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <SquadList players={homeSquad} teamName={match.home_team_name} />
                                    <SquadList players={awaySquad} teamName={match.away_team_name} />
                                </div>

                                <div className="flex justify-center py-12">
                                    <div className="text-center text-gray-400">
                                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">Confimed line-ups and match stats will be available after kickoff.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
