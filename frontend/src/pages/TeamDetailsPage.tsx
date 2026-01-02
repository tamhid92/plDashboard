import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { useTeam, usePlayers, useCompletedMatchesByTeam, useTeamForm } from '../api/queries';
import { Navbar } from '../components/layout/Navbar';
import { getTeamLogoUrl } from '../utils/teamLogos';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Line } from 'recharts';
import clsx from 'clsx';

export const TeamDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: team, isLoading } = useTeam(id);
    const { data: players } = usePlayers();

    // Use the global team form hook to ensure consistency with Overview page
    const teamForms = useTeamForm();
    const teamForm = teamForms[Number(id)] || [];
    // teamForm is [Newest, ..., Oldest] (max 5)
    // We want to display Oldest -> Newest (Left to Right)
    const recentForm = [...teamForm].reverse();

    // Fetch specifically this team's matches for other data if needed, valid check
    const { data: teamMatches } = useCompletedMatchesByTeam(id);



    // Prepare Trend Data (Rolling xG)
    const trendData = React.useMemo(() => {
        if (!teamMatches || !Array.isArray(teamMatches) || teamMatches.length === 0) {
            return [];
        }

        const validMatches = teamMatches
            .filter(m => m.home_team_score !== null && m.home_team_score !== undefined)
            .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime());

        return validMatches.map(m => {
            const isHome = m.home_team_id === Number(id);
            const stats = isHome ? m.home_stats : m.away_stats;
            const oppStats = isHome ? m.away_stats : m.home_stats;

            return {
                id: m.match_id,
                gameweek: m.gameweek,
                opponent: isHome ? m.away_team_abbr : m.home_team_abbr,
                result: isHome
                    ? (m.home_team_score > m.away_team_score ? 'W' : m.home_team_score === m.away_team_score ? 'D' : 'L')
                    : (m.away_team_score > m.home_team_score ? 'W' : m.away_team_score === m.home_team_score ? 'D' : 'L'),
                xg: stats?.expectedGoals || 0,
                xga: oppStats?.expectedGoals || 0,
                goals: isHome ? m.home_team_score : m.away_team_score,
                possession: stats?.possessionPercentage || 50,
            };
        });
    }, [teamMatches, id]);

    // Derived Stats
    const totalPasses = (team?.stats?.successfulPassesOwnHalf || 0) + (team?.stats?.successfulPassesOppositionHalf || 0);
    const fieldTilt = totalPasses > 0 ? (team?.stats?.successfulPassesOppositionHalf || 0) / totalPasses * 100 : 50;

    // Parallax
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
    const heroFilter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(10px)"]);
    const contentY = useTransform(scrollY, [0, 400], [0, -50]);

    // Filter players for this team
    const teamPlayers = players?.filter(p => p.team_id === Number(id)) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pl-purple"></div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Team not found</h2>
                <button onClick={() => navigate('/')} className="text-pl-purple font-bold hover:underline">Return Home</button>
            </div>
        );
    }

    // Pie Chart Data
    const passingData = [
        { name: 'Short', value: team.stats?.successfulShortPasses || 0, color: '#38003c' },
        { name: 'Long', value: team.stats?.successfulLongPasses || 0, color: '#e90052' },
    ];

    // Prepare Radar Data
    // Normalized to fill the chart better
    const radarData = [
        { subject: 'Attack', A: team.stats?.strength_attack_home || 1100, fullMark: 1400 },
        { subject: 'Defense', A: team.stats?.strength_defence_home || 1100, fullMark: 1400 },
        { subject: 'Possession', A: (team.stats?.possessionPercentage || 50) * 20, fullMark: 2000 },
        { subject: 'Creativity', A: (team.stats?.shotsOnTargetIncGoals || 50) * 8, fullMark: 2000 }, // Scale up
        { subject: 'Physicality', A: (team.stats?.duelsWon || 500), fullMark: 2000 }, // Remove divider to fill chart
    ];

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
                        className="w-40 h-40 md:w-56 md:h-56 p-6 rounded-[2.5rem] bg-white/50 backdrop-blur-md border border-white/60 shadow-xl flex items-center justify-center"
                    >
                        <img src={getTeamLogoUrl(team.name)} alt={team.abbr} className="w-full h-full object-contain filter drop-shadow-lg" />
                    </motion.div>

                    <div className="flex-1 text-center md:text-left">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="text-sm font-bold text-pl-purple uppercase tracking-widest mb-2">Premier League</div>
                            <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none">{team.name}</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-600 font-bold">
                                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
                                    <MapPin size={18} className="mr-2 text-pl-neon-pink" />
                                    {team.stadium}
                                </div>
                                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
                                    <Users size={18} className="mr-2 text-pl-neon-cyan" />
                                    {teamPlayers.length} Squad Players
                                </div>
                                {team.fpl_data && (
                                    <div className="flex items-center bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
                                        <TrendingUp size={18} className="mr-2 text-pl-neon-green" />
                                        Rank #{team.fpl_data.position}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content (Scrollable Layer) */}
            <motion.div style={{ y: contentY }} className="relative z-10 mt-[450px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">

                    {/* THEME 8: TEAM IDENTITY SUMMARY & THEME 7: FORM */}
                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pl-neon-green/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h2 className="text-2xl font-black tracking-tight mb-2">Team Identity</h2>
                            <p className="text-slate-400 text-sm mb-6">Tactical fingerprint based on season performance.</p>

                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#ffffff33" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 2000]} tick={false} axisLine={false} />
                                        <Radar name={team.name} dataKey="A" stroke="#00ff85" fill="#00ff85" fillOpacity={0.4} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-2 text-slate-900">Season Progression</h2>
                                <p className="text-slate-500 text-sm mb-6">Rolling Expected Goals (xG) vs Actual Goals. Reveals finishing quality and chance creation consistency.</p>
                            </div>

                            <div className="h-[250px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorXg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38003c" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#38003c" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="gameweek" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelStyle={{ color: '#64748b' }}
                                        />
                                        <Area type="monotone" dataKey="xg" stroke="#38003c" strokeWidth={2} fillOpacity={1} fill="url(#colorXg)" name="Expected Goals (xG)" />
                                        <Line type="monotone" dataKey="goals" stroke="#00ff85" strokeWidth={3} dot={{ r: 4, fill: '#00ff85', strokeWidth: 0 }} name="Goals Scored" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                <div className="text-sm font-bold text-slate-500">Recent Form</div>
                                <div className="flex items-center space-x-2">
                                    {recentForm.map((res, i) => (
                                        <span key={i} className={clsx(
                                            "w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-transform hover:scale-110 cursor-default",
                                            res === 'W' ? 'bg-pl-green text-pl-purple border border-pl-green' :
                                                res === 'D' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                    'bg-red-50 text-red-600 border border-red-100'
                                        )}>
                                            {res}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* THEME 1: GAME CONTROL */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Game Control & Territory</h2>
                            <div className="hidden md:flex items-center text-sm font-bold text-slate-500">
                                <div className="w-3 h-3 rounded-full bg-slate-300 mr-2"></div> Own Half
                                <div className="w-3 h-3 rounded-full bg-pl-purple mr-2 ml-4"></div> Opponent Half
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Field Tilt</h3>
                                <p className="text-slate-500 text-sm mb-8">
                                    Where is the team playing their passes? A higher percentage in the opposition half indicates territorial dominance.
                                </p>

                                <div className="relative h-24 bg-slate-100 rounded-2xl overflow-hidden flex items-center">
                                    {/* Left (Own Half) */}
                                    <div style={{ width: `${100 - fieldTilt}%` }} className="h-full bg-slate-200 flex flex-col items-center justify-center border-r border-white">
                                        <span className="text-2xl font-black text-slate-400">{Math.round(100 - fieldTilt)}%</span>
                                        <span className="text-[10px] font-bold uppercase text-slate-400">Own Half</span>
                                    </div>
                                    {/* Right (Opp Half) */}
                                    <div style={{ width: `${fieldTilt}%` }} className="h-full bg-pl-purple flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                                        <span className="text-2xl font-black text-white relative z-10">{Math.round(fieldTilt)}%</span>
                                        <span className="text-[10px] font-bold uppercase text-white/70 relative z-10">Opp. Half</span>
                                    </div>
                                </div>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Opp. Box Touches</div>
                                        <div className="text-2xl font-black text-slate-900">{team.stats?.touchesInOppBox || '-'}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Possession Avg</div>
                                        <div className="text-2xl font-black text-slate-900">{team.stats?.possessionPercentage}%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-full min-h-[200px] bg-pl-green/5 rounded-2xl p-6 flex flex-col justify-center items-center">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">Passing Style</h3>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={passingData}
                                                cx="50%" cy="50%"
                                                innerRadius={50}
                                                outerRadius={65}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {passingData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* THEME 2 & 3: ATTACK & GOALS */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Attack Funnel */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-2">Attacking Efficiency</h2>
                            <p className="text-slate-500 text-sm mb-8">Conversion from chance creation to final conclusion.</p>

                            <div className="space-y-6">
                                {/* Step 1: Shots */}
                                <div className="relative">
                                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                                        <span>Total Shots</span>
                                        <span>{team.stats?.totalShots}</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 w-full rounded-full"></div>
                                    </div>
                                </div>

                                {/* Step 2: On Target */}
                                <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                                        <span>On Target</span>
                                        <span>{team.stats?.shotsOnTargetIncGoals} ({Math.round(((team.stats?.shotsOnTargetIncGoals || 0) / (team.stats?.totalShots || 1)) * 100)}%)</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden w-[45%]">
                                        <div className="h-full bg-pl-purple w-full rounded-full"></div>
                                    </div>
                                </div>

                                {/* Step 3: Goals */}
                                <div className="relative pl-4 border-l-2 border-dashed border-gray-200">
                                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                                        <span>Goals Scored</span>
                                        <span>{team.stats?.goals} ({Math.round(((team.stats?.goals || 0) / (team.stats?.totalShots || 1)) * 100)}% conv.)</span>
                                    </div>
                                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden w-[16%]">
                                        <div className="h-full bg-pl-green w-full rounded-full"></div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 mt-6 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Expected Goals (xG)</div>
                                        <div className="text-2xl font-black text-slate-900">{Number(team.stats?.expectedGoals).toFixed(2)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Performance</div>
                                        <div className={clsx("text-lg font-bold",
                                            (team.stats?.goals || 0) > (team.stats?.expectedGoals || 0) ? "text-pl-green" : "text-red-500"
                                        )}>
                                            {(team.stats?.goals || 0) - (team.stats?.expectedGoals || 0) > 0 ? '+' : ''}
                                            {((team.stats?.goals || 0) - (team.stats?.expectedGoals || 0)).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Goal DNA */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-2">Goal Composition</h2>
                            <p className="text-slate-500 text-sm mb-8">How the team finds the back of the net.</p>

                            <div className="grid grid-cols-3 gap-2">
                                {/* Head */}
                                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 font-bold text-xl">
                                        {team.stats?.headedGoals || 0}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400">Headers</div>
                                </div>

                                {/* Right Foot */}
                                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 font-bold text-xl">
                                        {team.stats?.rightFootGoals || 0}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400">Right Foot</div>
                                </div>

                                {/* Left Foot */}
                                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2 font-bold text-xl">
                                        {team.stats?.leftFootGoals || 0}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400">Left Foot</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Set Piece Threat</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400 mb-1">Penalties</div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${(team.stats?.penaltyGoals || 0) * 10}%` }} className="h-full bg-slate-900 rounded-full"></div>
                                        </div>
                                        <div className="text-right text-xs font-bold mt-1 text-slate-900">{team.stats?.penaltyGoals} scored</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-gray-400 mb-1">Corners Won</div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: '60%' }} className="h-full bg-pl-pink rounded-full"></div>
                                        </div>
                                        <div className="text-right text-xs font-bold mt-1 text-slate-900">{team.stats?.cornersWon || '-'} total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* THEME 4, 5, 6: DEFENSE & PHYSICALITY */}
                    <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="col-span-1 border-r border-gray-100 pr-8">
                                <h2 className="text-xl font-black text-slate-900 mb-4">Duel Dominance</h2>
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="text-4xl font-black text-pl-purple">
                                        {Math.round((Number(team.stats?.duelsWon || 0) / (Number(team.stats?.duelsWon || 0) + Number(team.stats?.duelsLost || 1))) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium leading-tight">
                                        Overall Duel<br />Success Rate
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                            <span>Aerial</span>
                                            <span>{team.stats?.aerialDuelsWon} Won</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div style={{ width: `${(Number(team.stats?.aerialDuelsWon) / (Number(team.stats?.aerialDuelsWon) + Number(team.stats?.aerialDuelsLost || 1))) * 100}%` }} className="h-full bg-slate-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                            <span>Ground</span>
                                            <span>{team.stats?.groundDuelsWon || '-'} Won</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div style={{ width: `${(Number(team.stats?.groundDuelsWon) / (Number(team.stats?.groundDuelsWon) + Number(team.stats?.groundDuelsLost || 1))) * 100}%` }} className="h-full bg-pl-purple rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <h2 className="text-xl font-black text-slate-900 mb-4">Defensive Suppression</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                        <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Goals Conceded</div>
                                        <div className="text-3xl font-black text-red-900">{team.stats?.goalsConceded}</div>
                                        <div className="text-xs text-red-700 mt-1">
                                            {team.stats?.cleanSheets} Clean Sheets
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shots Faced</div>
                                        <div className="text-3xl font-black text-slate-900">{team.stats?.totalShotsConceded || '-'}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {team.stats?.shotsOnConcededInsideBox || '-'} inside box
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interceptions</div>
                                        <div className="text-3xl font-black text-slate-900">{team.stats?.interceptions}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            Reading the game
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Squad List */}
                    <section>
                        <h2 className="text-xl font-black text-slate-900 mb-6">Squad Depth</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {teamPlayers.map(player => (
                                <div
                                    key={player.player_id}
                                    onClick={() => navigate(`/player/${player.player_id}`)}
                                    className="flex items-center p-3 rounded-xl bg-white border border-gray-100 hover:border-pl-purple shadow-sm hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-xs mr-4 group-hover:bg-pl-purple group-hover:text-white transition-colors">
                                        {player.position.substring(0, 3)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-pl-purple transition-colors">{player.player_name}</div>
                                        <div className="text-xs text-gray-400 font-medium">
                                            {player.goals} G • {player.assists} A
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};
