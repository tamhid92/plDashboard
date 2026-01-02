import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useStandings, useTeamForm, useTeams, useUpcomingFixtures } from '../../api/queries';
import { getTeamLogoUrl } from '../../utils/teamLogos';

const FormBadge = ({ result }: { result: string }) => {
    const colors = {
        W: 'bg-pl-green text-pl-purple',
        D: 'bg-slate-200 text-slate-600',
        L: 'bg-red-100 text-red-600',
    };

    return (
        <span className={clsx(
            "w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-sm",
            colors[result as keyof typeof colors] || colors.D
        )}>
            {result}
        </span>
    );
};

export const StandingsTable: React.FC = () => {
    const navigate = useNavigate();
    const { data: standings, isLoading } = useStandings();
    const { data: teams } = useTeams();
    const { data: fixtures } = useUpcomingFixtures();
    const teamForm = useTeamForm();

    const getNextOpponent = (teamId: number) => {
        if (!fixtures) return null;
        const nextMatch = fixtures.find(f => f.home_team_id === teamId || f.away_team_id === teamId);
        if (!nextMatch) return null;

        const isHome = nextMatch.home_team_id === teamId;
        return {
            name: isHome ? nextMatch.away_team_name : nextMatch.home_team_name,
            abbr: isHome ? nextMatch.away_team_abbr : nextMatch.home_team_abbr,
            isHome
        };
    };

    const getTeamStats = (teamId: number) => {
        return teams?.find(t => t.id === teamId)?.stats;
    };

    if (isLoading) return <div className="animate-pulse h-96 bg-slate-100 rounded-lg"></div>;
    if (!standings) return <div>No data available</div>;

    return (
        <div className="glass-card rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-pl-purple to-transparent opacity-20 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-1 bg-pl-purple rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">League Table</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest uppercase">
                    <span className="text-pl-purple">Premier League</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-400">2025-26</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 uppercase text-[10px] tracking-wider">
                        <tr>
                            <th className="px-4 py-4 w-16 text-center">Pos</th>
                            <th className="px-4 py-4 w-64">Club</th>
                            <th className="px-4 py-4 w-12 text-center text-gray-400 hidden lg:table-cell">Pl</th>
                            <th className="px-4 py-4 w-12 text-center text-gray-400 hidden lg:table-cell">W</th>
                            <th className="px-4 py-4 w-12 text-center text-gray-400 hidden lg:table-cell">D</th>
                            <th className="px-4 py-4 w-12 text-center text-gray-400 hidden lg:table-cell">L</th>
                            <th className="px-4 py-4 w-16 text-center font-semibold text-gray-600">GD</th>
                            <th className="px-4 py-4 w-16 text-center font-bold text-slate-900 text-lg">Pts</th>
                            <th className="px-4 py-4 w-24 text-center font-semibold text-gray-600">xG</th>
                            <th className="px-4 py-4 text-center w-32 hidden md:table-cell">Form</th>
                            <th className="px-4 py-4 text-center w-24">Next</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {standings.map((team) => {
                            const isUCL = team.position <= 4;
                            const isEuropa = team.position === 5;
                            const isRelegation = team.position >= 18;

                            const form = teamForm[team.teamid] || [];
                            const recentForm = [...form].reverse().slice(0, 5);
                            const nextOpponent = getNextOpponent(team.teamid);
                            const stats = getTeamStats(team.teamid);

                            return (
                                <tr
                                    key={team.teamid}
                                    onClick={() => navigate(`/team/${team.teamid}`)}
                                    className="hover:bg-pl-purple/[0.02] transition-colors duration-300 group/row relative cursor-pointer"
                                >
                                    <td className="px-4 py-4 text-center relative w-16">
                                        {isUCL && <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-pl-neon-green rounded-r-full"></div>}
                                        {isEuropa && <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-pl-neon-cyan rounded-r-full"></div>}
                                        {isRelegation && <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-pl-neon-pink rounded-r-full"></div>}
                                        <span className={clsx(
                                            "font-bold transition-all duration-300",
                                            team.position === 1 ? "text-pl-purple scale-110 inline-block" : "text-gray-400 group-hover/row:text-slate-800"
                                        )}>{team.position}</span>
                                    </td>
                                    <td className="px-4 py-4 font-semibold text-slate-700">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative group-hover/row:scale-110 transition-transform duration-300">
                                                <img
                                                    src={getTeamLogoUrl(team.teamname)}
                                                    alt={team.teamabbr}
                                                    className="w-8 h-8 object-contain relative z-10 drop-shadow-sm"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/logos/epl.png'; }}
                                                />
                                            </div>
                                            <span className="text-lg tracking-tight group-hover/row:text-pl-purple transition-colors">{team.teamname}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-500 hidden lg:table-cell">{team.played}</td>
                                    <td className="px-4 py-4 text-center text-gray-500 hidden lg:table-cell">{team.won}</td>
                                    <td className="px-4 py-4 text-center text-gray-500 hidden lg:table-cell">{team.drawn}</td>
                                    <td className="px-4 py-4 text-center text-gray-500 hidden lg:table-cell">{team.lost}</td>
                                    <td className="px-4 py-4 text-center font-medium w-16">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-xs font-bold",
                                            team.goaldifference > 0 ? "text-pl-text-green bg-pl-neon-green/10" :
                                                team.goaldifference < 0 ? "text-pl-neon-pink bg-pl-neon-pink/10" : "text-gray-400 bg-gray-100"
                                        )}>
                                            {team.goaldifference > 0 ? '+' : ''}{team.goaldifference}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center w-16">
                                        <span className="text-xl font-bold text-slate-900 group-hover/row:text-pl-purple transition-colors duration-300">{team.points}</span>
                                    </td>
                                    {/* Cumulative xG Sort of... using aggregated stats */}
                                    <td className="px-4 py-4 text-center font-mono text-gray-500 group-hover/row:text-slate-900">
                                        {stats?.expectedGoals ? Number(stats.expectedGoals).toFixed(1) : '-'}
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="flex items-center justify-center space-x-1 opacity-70 group-hover/row:opacity-100 transition-opacity">
                                            {recentForm.map((res, i) => (
                                                <FormBadge key={i} result={res} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {nextOpponent && (
                                            <div className="flex items-center justify-center tooltip-trigger" title={`vs ${nextOpponent.name} (${nextOpponent.isHome ? 'H' : 'A'})`}>
                                                <img
                                                    src={getTeamLogoUrl(nextOpponent.name)}
                                                    alt={nextOpponent.abbr}
                                                    className="w-6 h-6 object-contain opacity-80 group-hover/row:opacity-100 hover:scale-110 transition-all"
                                                />
                                                <span className="ml-1 text-[10px] font-bold text-gray-400">{nextOpponent.isHome ? '(H)' : '(A)'}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
